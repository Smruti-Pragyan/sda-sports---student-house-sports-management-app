import { HouseName, type Student, type SportEvent, EventType, type House, AgeCategory } from './types';

export const STUDENT_CAPACITY = 1000;

export const HOUSES: House[] = [
  { name: HouseName.Yellow, color: 'bg-yellow-500', accentColor: 'border-yellow-500' },
  { name: HouseName.Blue, color: 'bg-blue-500', accentColor: 'border-blue-500' },
  { name: HouseName.Green, color: 'bg-green-500', accentColor: 'border-green-500' },
  { name: HouseName.Red, color: 'bg-red-500', accentColor: 'border-red-500' },
];

const d1 = new Date(); // today
const d2 = new Date(); d2.setDate(d1.getDate() - 6); // within a week
const d3 = new Date(); d3.setDate(d1.getDate() - 15); // within a month
const d4 = new Date(); d4.setDate(d1.getDate() - 40); // older than a month

const d1ISO = d1.toISOString();
const d2ISO = d2.toISOString();
const d3ISO = d3.toISOString();
const d4ISO = d4.toISOString();

export const INITIAL_STUDENTS: Student[] = [
  { id: 's1', fullName: 'Liam Smith', class: '10', uid: '1', phone: '1234567890', house: HouseName.Red, category: AgeCategory.U16, createdAt: d1ISO, updatedAt: d1ISO },
  { id: 's2', fullName: 'Olivia Johnson', class: '9', uid: '2', phone: '2345678901', house: HouseName.Blue, category: AgeCategory.U16, createdAt: d1ISO, updatedAt: d1ISO },
  { id: 's3', fullName: 'Noah Williams', class: '12', uid: '3', phone: '3456789012', house: HouseName.Green, category: AgeCategory.U19, createdAt: d1ISO, updatedAt: d1ISO },
  { id: 's4', fullName: 'Emma Brown', class: '8', uid: '4', phone: '4567890123', house: HouseName.Yellow, category: AgeCategory.U13, createdAt: d1ISO, updatedAt: d1ISO },
  { id: 's5', fullName: 'Oliver Jones', class: '11', uid: '5', phone: '5678901234', house: HouseName.Red, category: AgeCategory.U19, createdAt: d1ISO, updatedAt: d1ISO },
  { id: 's6', fullName: 'Ava Garcia', class: '7', uid: '6', phone: '6789012345', house: HouseName.Blue, category: AgeCategory.U13, createdAt: d2ISO, updatedAt: d2ISO },
  { id: 's7', fullName: 'Elijah Miller', class: '10', uid: '7', phone: '7890123456', house: HouseName.Green, category: AgeCategory.U16, createdAt: d2ISO, updatedAt: d2ISO },
  { id: 's8', fullName: 'Charlotte Davis', class: '9', uid: '8', phone: '8901234567', house: HouseName.Yellow, category: AgeCategory.U16, createdAt: d2ISO, updatedAt: d2ISO },
  { id: 's9', fullName: 'James Rodriguez', class: '12', uid: '9', phone: '9012345678', house: HouseName.Red, category: AgeCategory.U19, createdAt: d2ISO, updatedAt: d2ISO },
  { id: 's10', fullName: 'Sophia Martinez', class: '8', uid: '10', phone: '0123456789', house: HouseName.Blue, category: AgeCategory.U13, createdAt: d2ISO, updatedAt: d2ISO },
  { id: 's11', fullName: 'William Hernandez', class: '11', uid: '11', phone: '1123456780', house: HouseName.Green, category: AgeCategory.U19, createdAt: d3ISO, updatedAt: d3ISO },
  { id: 's12', fullName: 'Isabella Lopez', class: '7', uid: '12', phone: '1223456781', house: HouseName.Yellow, category: AgeCategory.U13, createdAt: d3ISO, updatedAt: d3ISO },
  { id: 's13', fullName: 'Benjamin Gonzalez', class: '10', uid: '13', phone: '1323456782', house: HouseName.Red, category: AgeCategory.U16, createdAt: d3ISO, updatedAt: d3ISO },
  { id: 's14', fullName: 'Mia Wilson', class: '9', uid: '14', phone: '1423456783', house: HouseName.Blue, category: AgeCategory.U16, createdAt: d3ISO, updatedAt: d3ISO },
  { id: 's15', fullName: 'Lucas Anderson', class: '12', uid: '15', phone: '1523456784', house: HouseName.Green, category: AgeCategory.U19, createdAt: d3ISO, updatedAt: d3ISO },
  { id: 's16', fullName: 'Harper Thomas', class: '8', uid: '16', phone: '1623456785', house: HouseName.Yellow, category: AgeCategory.U13, createdAt: d4ISO, updatedAt: d4ISO },
  { id: 's17', fullName: 'Henry Taylor', class: '11', uid: '17', phone: '1723456786', house: HouseName.Red, category: AgeCategory.U19, createdAt: d4ISO, updatedAt: d4ISO },
  { id: 's18', fullName: 'Evelyn Moore', class: '7', uid: '18', phone: '1823456787', house: HouseName.Blue, category: AgeCategory.U13, createdAt: d4ISO, updatedAt: d4ISO },
  { id: 's19', fullName: 'Alexander Jackson', class: '10', uid: '19', phone: '1923456788', house: HouseName.Green, category: AgeCategory.U16, createdAt: d4ISO, updatedAt: d4ISO },
  { id: 's20', fullName: 'Abigail White', class: '9', uid: '20', phone: '2023456789', house: HouseName.Yellow, category: AgeCategory.U16, createdAt: d4ISO, updatedAt: d4ISO },
];


export const INITIAL_EVENTS: SportEvent[] = [
  {
    id: 'e1',
    name: '100m Race',
    type: EventType.Individual,
    status: 'Completed',
    participants: [],
    maxParticipants: 50,
    createdAt: d1ISO,
    updatedAt: d1ISO,
  },
  {
    id: 'e2',
    name: 'Football',
    type: EventType.Team,
    status: 'Ongoing',
    participants: [],
    maxParticipants: 60,
    createdAt: d1ISO,
    updatedAt: d1ISO,
  },
  {
    id: 'e3',
    name: 'Long Jump',
    type: EventType.Individual,
    status: 'Upcoming',
    participants: [],
    maxParticipants: 50,
    createdAt: d2ISO,
    updatedAt: d2ISO,
  },
  { id: 'e4', name: 'Relay Race', type: EventType.Team, status: 'Upcoming', participants: [], maxParticipants: 50, createdAt: d2ISO, updatedAt: d2ISO },
  { id: 'e5', name: 'Basketball', type: EventType.Team, status: 'Upcoming', participants: [], maxParticipants: 50, createdAt: d2ISO, updatedAt: d2ISO },
  { id: 'e6', name: 'Volleyball', type: EventType.Team, status: 'Ongoing', participants: [], maxParticipants: 50, createdAt: d3ISO, updatedAt: d3ISO },
  { id: 'e7', name: 'High Jump', type: EventType.Individual, status: 'Upcoming', participants: [], maxParticipants: 50, createdAt: d3ISO, updatedAt: d3ISO },
  { id: 'e8', name: 'Shot Put', type: EventType.Individual, status: 'Completed', participants: [], maxParticipants: 50, createdAt: d3ISO, updatedAt: d3ISO },
  { id: 'e9', name: 'Badminton', type: EventType.Individual, status: 'Upcoming', participants: [], maxParticipants: 50, createdAt: d4ISO, updatedAt: d4ISO },
  { id: 'e10', name: 'Chess', type: EventType.Individual, status: 'Upcoming', participants: [], maxParticipants: 50, createdAt: d4ISO, updatedAt: d4ISO },
];