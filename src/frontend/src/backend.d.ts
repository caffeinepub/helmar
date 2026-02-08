import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface Comment {
    id: string;
    text: string;
    author: Principal;
    timestamp: Time;
}
export interface Notification {
    id: string;
    notificationType: NotificationType;
    recipient: Principal;
    isRead: boolean;
    message: string;
    timestamp: Time;
}
export interface VideoPost {
    id: string;
    title: string;
    creator: Principal;
    description: string;
    videoBlob: ExternalBlob;
    likes: Array<Principal>;
    timestamp: Time;
    comments: Array<Comment>;
}
export interface UserProfile {
    bio: string;
    username: string;
    profilePicture?: ExternalBlob;
}
export enum NotificationType {
    like = "like",
    comment = "comment",
    message = "message",
    follow = "follow"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addComment(videoId: string, commentText: string): Promise<string>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createVideoPost(title: string, description: string, videoBlob: ExternalBlob): Promise<string>;
    followUser(userToFollow: Principal): Promise<void>;
    getAllVideoPosts(): Promise<Array<VideoPost>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFollowers(user: Principal): Promise<Array<Principal>>;
    getNotifications(): Promise<Array<Notification>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVideoPost(videoId: string): Promise<VideoPost | null>;
    isCallerAdmin(): Promise<boolean>;
    likeVideo(videoId: string): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateNotificationStatus(notificationId: string, isRead: boolean): Promise<void>;
}
