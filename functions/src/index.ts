import * as admin from "firebase-admin";

admin.initializeApp();

export { onUserCreated } from "./user-triggers";
export { onGenerationJobCreated } from "./video-renderer";
export { generateVideoScript } from "./script-generator";
