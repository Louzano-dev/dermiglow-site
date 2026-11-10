import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { RoutineResult } from "./routine.server";

const RoutineRequest = z.object({
  skin: z.string().min(1).max(40),
  goal: z.string().min(1).max(40),
  level: z.string().min(1).max(40).optional(),
  seed: z.number().int().min(0).max(1_000_000),
});

export const buildRoutine = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => RoutineRequest.parse(input))
  .handler(async ({ data }): Promise<RoutineResult> => {
    const { buildDemoRoutine } = await import("./demo-routine");
    return buildDemoRoutine(data);
  });
