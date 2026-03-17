import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
export { ApiResponse } from "./ApiResponse";

export const apiHandler = (baseHandler: any) => {
  return middy(baseHandler).use(httpJsonBodyParser());
};
