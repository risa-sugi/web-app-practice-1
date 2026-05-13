export type WeatherSnapshot = {
  region: string;
  current: {
    temp: number;
    feelsLike: number;
    description: string;
    iconCode: string;
    pop: number;
  };
  tomorrow: {
    tempMin: number;
    tempMax: number;
    description: string;
    iconCode: string;
    pop: number;
  };
};

export type WeatherErrorBody = {
  error: string;
};
