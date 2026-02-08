import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Blob "mo:core/Blob";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Int "mo:core/Int";
import Runtime "mo:core/Runtime";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // User Profile
  public type UserProfile = {
    username : Text;
    bio : Text;
    profilePicture : ?Storage.ExternalBlob;
  };

  module UserProfile {
    public func compare(p1 : UserProfile, p2 : UserProfile) : Order.Order {
      Text.compare(p1.username, p2.username);
    };
  };

  // Video Post
  public type VideoPost = {
    id : Text;
    creator : Principal;
    title : Text;
    description : Text;
    videoBlob : Storage.ExternalBlob;
    timestamp : Time.Time;
    likes : [Principal];
    comments : [Comment];
  };

  module VideoPost {
    public func compare(p1 : VideoPost, p2 : VideoPost) : Order.Order {
      Int.compare(p2.timestamp, p1.timestamp); // Most recent first
    };
  };

  public type Comment = {
    id : Text;
    author : Principal;
    text : Text;
    timestamp : Time.Time;
  };

  module Comment {
    public func compare(c1 : Comment, c2 : Comment) : Order.Order {
      Int.compare(c1.timestamp, c2.timestamp);
    };
  };

  public type NotificationType = {
    #like;
    #comment;
    #follow;
    #message;
  };

  public type Notification = {
    id : Text;
    recipient : Principal;
    message : Text;
    notificationType : NotificationType;
    isRead : Bool;
    timestamp : Time.Time;
  };

  module Notification {
    public func compare(n1 : Notification, n2 : Notification) : Order.Order {
      Int.compare(n2.timestamp, n1.timestamp); // Most recent first
    };
  };

  public type Follow = {
    follower : Principal;
    following : Principal;
  };

  // Persistent storage
  var nextVideoId = 0;
  var nextCommentId = 0;
  var nextNotificationId = 0;

  let userProfiles = Map.empty<Principal, UserProfile>();
  let videoPosts = Map.empty<Text, VideoPost>();
  let followers = Map.empty<Principal, [Principal]>();
  let notifications = Map.empty<Principal, [Notification]>();

  // User Profile Management Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Create Video Post
  public shared ({ caller }) func createVideoPost(title : Text, description : Text, videoBlob : Storage.ExternalBlob) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can post videos");
    };

    let videoId = "video-" # debug_show(nextVideoId);
    let post : VideoPost = {
      id = videoId;
      creator = caller;
      title;
      description;
      videoBlob;
      timestamp = Time.now();
      likes = [];
      comments = [];
    };

    videoPosts.add(videoId, post);
    nextVideoId += 1;
    videoId;
  };

  public shared ({ caller }) func likeVideo(videoId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like videos");
    };

    let post = switch (videoPosts.get(videoId)) {
      case (null) { Runtime.trap("Video not found") };
      case (?p) { p };
    };

    if (post.likes.find(func(p) { p == caller }) != null) {
      Runtime.trap("You have already liked this video");
    };

    let updatedLikes = post.likes.concat([caller]); // Corrected line
    let updatedPost = { post with likes = updatedLikes };
    videoPosts.add(videoId, updatedPost);

    // Notification for video creator (only if not liking own video)
    if (post.creator != caller) {
      let notification : Notification = {
        id = "notification-" # debug_show(nextNotificationId);
        recipient = post.creator;
        message = "Your video '" # post.title # "' was liked!";
        notificationType = #like;
        isRead = false;
        timestamp = Time.now();
      };

      let userNotifications = switch (notifications.get(post.creator)) {
        case (null) { [notification] };
        case (?existing) { existing.concat([notification]) };
      };
      notifications.add(post.creator, userNotifications);

      nextNotificationId += 1;
    };
  };

  public shared ({ caller }) func addComment(videoId : Text, commentText : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can comment on videos");
    };

    let post = switch (videoPosts.get(videoId)) {
      case (null) { Runtime.trap("Video not found") };
      case (?p) { p };
    };

    let commentId = "comment-" # debug_show(nextCommentId);
    let comment : Comment = {
      id = commentId;
      author = caller;
      text = commentText;
      timestamp = Time.now();
    };

    let updatedComments = post.comments.concat([comment]); // Corrected line
    let updatedPost = { post with comments = updatedComments };
    videoPosts.add(videoId, updatedPost);

    // Notification for video creator (only if not commenting on own video)
    if (post.creator != caller) {
      let notification : Notification = {
        id = "notification-" # debug_show(nextNotificationId);
        recipient = post.creator;
        message = "Your video '" # post.title # "' received a new comment!";
        notificationType = #comment;
        isRead = false;
        timestamp = Time.now();
      };

      let userNotifications = switch (notifications.get(post.creator)) {
        case (null) { [notification] };
        case (?existing) { existing.concat([notification]) };
      };
      notifications.add(post.creator, userNotifications);

      nextNotificationId += 1;
    };

    nextCommentId += 1;
    commentId;
  };

  public shared ({ caller }) func followUser(userToFollow : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can follow others");
    };

    if (caller == userToFollow) {
      Runtime.trap("You cannot follow yourself");
    };

    let currentFollowers = switch (followers.get(userToFollow)) {
      case (null) { [] };
      case (?existing) { existing };
    };

    if (currentFollowers.find(func(p) { p == caller }) != null) {
      Runtime.trap("Duplicate follow: You are already following this user");
    };

    let updatedFollowers = currentFollowers.concat([caller]); // Corrected line
    followers.add(userToFollow, updatedFollowers);

    // Notification for followed user
    let notification : Notification = {
      id = "notification-" # debug_show(nextNotificationId);
      recipient = userToFollow;
      message = "You have a new follower!";
      notificationType = #follow;
      isRead = false;
      timestamp = Time.now();
    };

    let userNotifications = switch (notifications.get(userToFollow)) {
      case (null) { [notification] };
      case (?existing) { existing.concat([notification]) };
    };
    notifications.add(userToFollow, userNotifications);

    nextNotificationId += 1;
  };

  public shared ({ caller }) func updateNotificationStatus(notificationId : Text, isRead : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update notifications");
    };

    let callerNotifications = switch (notifications.get(caller)) {
      case (null) { Runtime.trap("No notifications found for user") };
      case (?n) { n };
    };

    // Verify the notification belongs to the caller
    let notificationExists = callerNotifications.find(
      func(n) { n.id == notificationId and n.recipient == caller }
    );

    if (notificationExists == null) {
      Runtime.trap("Unauthorized: Notification not found or does not belong to you");
    };

    let updatedNotifications = callerNotifications.map(
      func(notification) {
        if (notification.id == notificationId) {
          { notification with isRead };
        } else {
          notification;
        };
      }
    );

    notifications.add(caller, updatedNotifications);
  };

  public query ({ caller }) func getNotifications() : async [Notification] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view notifications");
    };

    switch (notifications.get(caller)) {
      case (null) { [] };
      case (?n) {
        n.sort<Notification>();
      };
    };
  };

  public query ({ caller }) func getVideoPost(videoId : Text) : async ?VideoPost {
    // Any user including guests can view video posts
    videoPosts.get(videoId);
  };

  public query ({ caller }) func getAllVideoPosts() : async [VideoPost] {
    // Any user including guests can view video posts
    let posts = videoPosts.values().toArray();
    posts.sort<VideoPost>();
  };

  public query ({ caller }) func getFollowers(user : Principal) : async [Principal] {
    // Any user including guests can view followers
    switch (followers.get(user)) {
      case (null) { [] };
      case (?f) { f };
    };
  };
};
