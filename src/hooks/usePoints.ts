import { useMemo } from 'react';
import { Student, SportEvent, HouseName } from '../../types';

interface HousePoint {
  name: HouseName;
  score: number;
}

interface StudentPoint {
  studentId: string;
  student?: Student;
  score: number;
}

export function usePoints(students: Student[], events: SportEvent[]) {
  // Calculate house points
  const housePoints: HousePoint[] = useMemo(() => {
    const points: Record<HouseName, number> = {
      [HouseName.Yellow]: 0,
      [HouseName.Blue]: 0,
      [HouseName.Green]: 0,
      [HouseName.Red]: 0,
    };
    for (const event of events) {
      for (const p of event.participants) {
        const student = students.find(s => s.id === p.studentId);
        if (student) {
          points[student.house] += p.score;
        }
      }
    }
    return Object.entries(points).map(([name, score]) => ({ name: name as HouseName, score }));
  }, [students, events]);

  // Calculate student points
  const studentPoints: StudentPoint[] = useMemo(() => {
    return students.map(student => {
      let score = 0;
      for (const event of events) {
        for (const p of event.participants) {
          if (p.studentId === student.id) {
            score += p.score;
          }
        }
      }
      return { studentId: student.id, student, score };
    }).sort((a, b) => b.score - a.score);
  }, [students, events]);

  return { housePoints, studentPoints };
}
