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
  fullName: string;
  class: string;
  rollNumber: string;
  phone: string;
  house: HouseName;
  category: AgeCategory;
  createdAt: string;
  updatedAt: string;
}

export interface Participant {
  studentId: string;
  score: number;
}

export interface SportEvent {
  id: string;
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
    name: string;
    email: string;
    profilePictureUrl: string;
}