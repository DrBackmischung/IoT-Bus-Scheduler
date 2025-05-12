export const routeScenario = [
    {
        name: 'Walldorf Bahnhof',
        boardingTime: 30 / 60,
        enter: 40,
        exit: 0,
        distanceToNext: 0.3,
        speedToNext: 30,
        arrivalRateFn: (t) => {
            const time = typeof t === 'number' && Number.isFinite(t) ? t : 0;
            return 0.5 + 0.01 * time;
        },
    },
    {
        name: 'HDM ABZ',
        boardingTime: 5 / 60,
        enter: 0,
        exit: 1,
        distanceToNext: 0.15,
        speedToNext: 30,
        arrivalRateFn: (t) => {
            const time = typeof t === 'number' && Number.isFinite(t) ? t : 0;
            return 0.5 + 0.01 * time;
        },
    },
    {
        name: 'HDM Haupteingang',
        boardingTime: 10 / 60,
        enter: 0,
        exit: 12,
        distanceToNext: 0,
        speedToNext: 0,
        arrivalRateFn: (t) => {
            const time = typeof t === 'number' && Number.isFinite(t) ? t : 0;
            return 0.5 + 0.01 * time;
        },
    }
  ];
  