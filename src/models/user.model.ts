import { Address, User, UserPreferences, UserProfile, UserRole, UserStatus } from '@/types/entities/user.entity';
import { Document, model, Model, Schema } from 'mongoose';

// Mongoose Document types
export interface IUserDocument extends Omit<User, 'id'>, Document {
    _id: Schema.Types.ObjectId;
}

export interface IUserProfileDocument extends Omit<UserProfile, 'id'>, Document {
    _id: Schema.Types.ObjectId;
}

// Address Schema
const addressSchema = new Schema<Address>({
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true }
}, { _id: false });

// User Preferences Schema
const userPreferencesSchema = new Schema<UserPreferences>({
    notifications: { type: Boolean, default: true },
    newsletter: { type: Boolean, default: false },
    theme: { type: String, enum: ['LIGHT', 'DARK'], default: 'LIGHT' }
}, { _id: false });

// User Schema
const userSchema = new Schema<IUserDocument>({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        select: false // Don't include password by default in queries
    },
    status: {
        type: String,
        enum: Object.values(UserStatus),
        default: UserStatus.ACTIVE,
        index: true
    },
    role: {
        type: String,
        enum: Object.values(UserRole),
        default: UserRole.USER
    },
    profileId: {
        type: String,
        required: false
    },
    lastLoginAt: {
        type: Date,
        required: false
    }
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt
    collection: 'users'
});

// User Profile Schema
const userProfileSchema = new Schema<IUserProfileDocument>({
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    avatar: {
        type: String,
        required: false
    },
    bio: {
        type: String,
        required: false
    },
    phone: {
        type: String,
        required: false
    },
    address: {
        type: addressSchema,
        required: false
    },
    preferences: {
        type: userPreferencesSchema,
        required: true,
        default: () => ({
            notifications: true,
            newsletter: false,
            theme: 'LIGHT'
        })
    }
}, {
    timestamps: true,
    collection: 'user_profiles'
});

// Create and export models
export const UserModel: Model<IUserDocument> = model<IUserDocument>('User', userSchema);
export const UserProfileModel: Model<IUserProfileDocument> = model<IUserProfileDocument>('UserProfile', userProfileSchema);
