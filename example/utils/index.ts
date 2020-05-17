import { format, parse, subDays } from 'date-fns';
import Faker from 'faker';

export function generateRandomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export interface ListItemData {
  id: string;
  title: string;
  subtitle: string;
  amount: string;
  iconColor: string;
}

export const createMockData = () => {
  const elementsByDate: {
    [key: string]: ListItemData[];
  } = {};
  const today = new Date();
  Array.from({ length: 200 }).forEach((_, index) => {
    const date = format(
      subDays(today, generateRandomIntFromInterval(0, 30)),
      'yyyy LL d'
    );
    const amount = (generateRandomIntFromInterval(100, 10000) / 100).toFixed(2);
    const randomEntry = {
      id: String(index),
      title: Faker.commerce.productName(),
      subtitle: Faker.commerce.productMaterial(),
      amount,
      iconColor: `rgb(${generateRandomIntFromInterval(
        0,
        255
      )}, ${generateRandomIntFromInterval(
        0,
        255
      )}, ${generateRandomIntFromInterval(0, 255)})`,
    };
    if (Array.isArray(elementsByDate[date])) {
      elementsByDate[date].push(randomEntry);
    } else {
      elementsByDate[date] = [randomEntry];
    }
  });

  return Object.entries(elementsByDate)
    .map(([key, data]) => ({
      title: key,
      data,
    }))
    .sort((a, b) => {
      return (
        parse(b.title, 'yyyy LL d', new Date()).getTime() -
        parse(a.title, 'yyyy LL d', new Date()).getTime()
      );
    })
    .map(item => ({
      ...item,
      title: format(parse(item.title, 'yyyy LL d', new Date()), 'ccc d MMM'),
    }));
};
