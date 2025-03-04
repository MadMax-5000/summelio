import { Index } from "@upstash/vector";

export const getUpStachIndex = () => {
  return new Index({
    url: process.env.UPSTACH_VECTOR_URL!,
    token: process.env.UPSTACH_VECTOR_TOKEN!,
  });
};
