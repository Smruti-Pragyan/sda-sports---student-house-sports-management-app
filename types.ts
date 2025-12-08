export enum HouseName {
  Yellow = 'Yellow',
  Blue = 'Blue',
  Green = 'Green',
  Red = 'Red',
}

export enum EventType {
  Individual = 'Individual',
  Team = 'Team',
}

export enum AgeCategory {
  U13 = 'U13',
  U16 = 'U16',
  U19 = 'U19',
}

export interface Student {
  id: string;
  _id?: string; // Added for MongoDB compatibility
  fullName: string;
  class: string;
  uid: string;
  phone: string;
  house: HouseName;
  category: AgeCategory;
  createdAt: string;
  updatedAt: string;
}

export interface Participant {
  studentId: string | { _id: string; fullName: string }; // Updated to handle populated data
  score: number;
}

export interface SportEvent {
  id: string;
  _id?: string; // Added for MongoDB compatibility
  name: string;
  type: EventType;
  status: 'Upcoming' | 'Ongoing' | 'Completed';
  participants: Participant[];
  maxParticipants: number;
  createdAt: string;
  updatedAt: string;
}

export interface House {
    name: HouseName;
    color: string;
    accentColor: string;
}

export type View = 'dashboard' | 'students' | 'events' | 'settings' | 'profile' | 'house-yellow' | 'house-blue' | 'house-green' | 'house-red';

export type Theme = 'light' | 'dark';

export interface AdminProfile {
    _id?: string;
    name: string;
    email: string;
    profilePictureUrl: string;
}