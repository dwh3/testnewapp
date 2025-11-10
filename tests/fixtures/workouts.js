/**
 * Test fixtures for workout data
 */

module.exports = {
  singleExercise: {
    id: 'ex-001',
    name: 'Bench Press',
    sets: 3,
    reps: 10,
    weight: 135,
    notes: ''
  },

  fullWorkout: {
    id: 'workout-001',
    userId: 'user-001',
    date: '2024-01-15',
    exercises: [
      {
        id: 'ex-001',
        name: 'Bench Press',
        sets: 3,
        reps: 10,
        weight: 135
      },
      {
        id: 'ex-002',
        name: 'Squats',
        sets: 4,
        reps: 8,
        weight: 185
      },
      {
        id: 'ex-003',
        name: 'Deadlift',
        sets: 3,
        reps: 5,
        weight: 225
      }
    ],
    duration: 60,
    notes: 'Good workout'
  },

  workoutTemplate: {
    id: 'template-001',
    name: 'Push Day',
    exercises: [
      { name: 'Bench Press', sets: 3, reps: 10 },
      { name: 'Overhead Press', sets: 3, reps: 8 },
      { name: 'Tricep Dips', sets: 3, reps: 12 }
    ]
  },

  multipleWorkouts: [
    {
      id: 'workout-101',
      date: '2024-01-01',
      exercises: [
        { name: 'Bench Press', sets: 3, reps: 10, weight: 135 }
      ]
    },
    {
      id: 'workout-102',
      date: '2024-01-03',
      exercises: [
        { name: 'Squats', sets: 4, reps: 8, weight: 185 }
      ]
    },
    {
      id: 'workout-103',
      date: '2024-01-05',
      exercises: [
        { name: 'Deadlift', sets: 3, reps: 5, weight: 225 }
      ]
    }
  ],

  exerciseTemplates: [
    { name: 'Bench Press', category: 'chest', equipment: 'barbell' },
    { name: 'Squats', category: 'legs', equipment: 'barbell' },
    { name: 'Deadlift', category: 'back', equipment: 'barbell' },
    { name: 'Pull-ups', category: 'back', equipment: 'bodyweight' },
    { name: 'Push-ups', category: 'chest', equipment: 'bodyweight' }
  ]
};
