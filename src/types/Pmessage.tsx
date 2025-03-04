import { appRouter } from "@/trpc";
import { inferRouterOutputs } from "@trpc/server";
import React from "react";

type RouterOutput = inferRouterOutputs<appRouter>;

type Messages = RouterOutput["getFileMessages"]["messages"];

type OmitText = Omit<Messages[number], "text">;

type ExtendedText = {
  text: string | React.JSX.Element;
};

export type ExtendedMessage = OmitText & ExtendedText;
