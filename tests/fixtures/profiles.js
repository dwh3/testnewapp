/**
 * Test fixtures for complete profile data
 */

module.exports = {
  emptyProfile: {
    id: 'profile-empty',
    name: 'Empty Profile',
    created: '2024-01-01T00:00:00.000Z',
    workouts: [],
    meals: [],
    measurements: []
  },

  activeProfile: {
    id: 'profile-active',
    name: 'Active User',
    age: 28,
    weight: 170,
    height: 68,
    goal: 'lose_weight',
    pinHash: '1234abcd'.repeat(8),
    pinSalt: 'salt'.repeat(8),
    created: '2024-01-01T00:00:00.000Z',
    workouts: [
      {
        id: 'w1',
        date: '2024-01-15',
        exercises: [
          { name: 'Running', duration: 30, calories: 300 }
        ]
      }
    ],
    meals: [
      {
        id: 'm1',
        date: '2024-01-15',
        type: 'breakfast',
        foods: [
          { name: 'Oatmeal', calories: 150 }
        ]
      }
    ],
    measurements: [
      {
        date: '2024-01-15',
        weight: 170,
        bodyFat: 18
      }
    ]
  },

  profilesArray: [
    {
      id: 'p1',
      name: 'Profile 1',
      pinHash: 'hash1'.repeat(12),
      pinSalt: 'salt1'.repeat(6)
    },
    {
      id: 'p2',
      name: 'Profile 2',
      pinHash: 'hash2'.repeat(12),
      pinSalt: 'salt2'.repeat(6)
    },
    {
      id: 'p3',
      name: 'Profile 3',
      pinHash: 'hash3'.repeat(12),
      pinSalt: 'salt3'.repeat(6)
    }
  ],

  profileWithLegacyPin: {
    id: 'profile-legacy',
    name: 'Legacy Profile',
    pin: '1234', // Plaintext - needs migration
    age: 35,
    weight: 180,
    height: 70,
    created: '2023-01-01T00:00:00.000Z'
  },

  completeProfileData: {
    id: 'profile-complete',
    name: 'Complete Test User',
    age: 32,
    weight: 175,
    height: 70,
    goal: 'gain_muscle',
    pinHash: 'a'.repeat(64),
    pinSalt: 'b'.repeat(32),
    created: '2024-01-01T00:00:00.000Z',
    lastLogin: '2024-01-15T10:30:00.000Z',
    workouts: [
      {
        id: 'w1',
        date: '2024-01-10',
        exercises: [
          { name: 'Bench Press', sets: 4, reps: 8, weight: 185 },
          { name: 'Squats', sets: 4, reps: 10, weight: 225 }
        ],
        duration: 45,
        notes: 'Great session'
      },
      {
        id: 'w2',
        date: '2024-01-12',
        exercises: [
          { name: 'Deadlift', sets: 3, reps: 5, weight: 275 }
        ],
        duration: 30
      }
    ],
    meals: [
      {
        id: 'm1',
        date: '2024-01-10',
        type: 'breakfast',
        foods: [
          { name: 'Eggs', calories: 140, protein: 12 },
          { name: 'Toast', calories: 80, protein: 3 }
        ],
        totalCalories: 220
      },
      {
        id: 'm2',
        date: '2024-01-10',
        type: 'lunch',
        foods: [
          { name: 'Chicken Breast', calories: 165, protein: 31 },
          { name: 'Rice', calories: 200, protein: 4 }
        ],
        totalCalories: 365
      }
    ],
    measurements: [
      { date: '2024-01-01', weight: 178, bodyFat: 16 },
      { date: '2024-01-08', weight: 176, bodyFat: 15.5 },
      { date: '2024-01-15', weight: 175, bodyFat: 15 }
    ],
    settings: {
      theme: 'dark',
      units: 'imperial',
      notifications: true
    }
  }
};
