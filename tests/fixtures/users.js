/**
 * Test fixtures for user profiles
 */

module.exports = {
  validUser: {
    id: 'user-001',
    name: 'Test User',
    age: 30,
    weight: 180,
    height: 70,
    goal: 'lose_weight',
    created: '2024-01-01T00:00:00.000Z'
  },

  userWithHashedPin: {
    id: 'user-002',
    name: 'Secure User',
    age: 25,
    weight: 150,
    height: 65,
    goal: 'maintain',
    pinHash: 'a'.repeat(64), // Mock 256-bit hash
    pinSalt: 'b'.repeat(32),  // Mock 128-bit salt
    created: '2024-01-15T00:00:00.000Z'
  },

  legacyUserWithPlaintextPin: {
    id: 'user-003',
    name: 'Legacy User',
    age: 35,
    weight: 200,
    height: 72,
    goal: 'gain_muscle',
    pin: '1234', // Old plaintext PIN (needs migration)
    created: '2023-12-01T00:00:00.000Z'
  },

  multipleUsers: [
    {
      id: 'user-101',
      name: 'Alice',
      age: 28,
      weight: 140,
      height: 65,
      goal: 'lose_weight'
    },
    {
      id: 'user-102',
      name: 'Bob',
      age: 32,
      weight: 190,
      height: 72,
      goal: 'gain_muscle'
    },
    {
      id: 'user-103',
      name: 'Charlie',
      age: 45,
      weight: 170,
      height: 68,
      goal: 'maintain'
    }
  ],

  userWithCompleteProfile: {
    id: 'user-999',
    name: 'Complete User',
    age: 30,
    weight: 175,
    height: 70,
    goal: 'lose_weight',
    pinHash: 'abcd1234'.repeat(8),
    pinSalt: 'salt5678'.repeat(4),
    workouts: [
      {
        id: 'workout-1',
        date: '2024-01-01',
        exercises: [
          { name: 'Bench Press', sets: 3, reps: 10, weight: 135 }
        ]
      }
    ],
    meals: [
      {
        id: 'meal-1',
        date: '2024-01-01',
        type: 'breakfast',
        foods: [
          { name: 'Eggs', calories: 140 }
        ]
      }
    ],
    created: '2024-01-01T00:00:00.000Z'
  }
};
