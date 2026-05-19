export const PRODUCT_STAGES = [
  "Kickstart",
  "Concept",
  "Architecture",
  "Build",
  "Deployment",
  "Validation",
  "Operate",
] as const;

export const RELEASE_MATURITY_STATES = [
  "Internal",
  "Alpha",
  "Beta",
  "MVP",
  "Full Release",
] as const;

export type ProductStage = (typeof PRODUCT_STAGES)[number];
export type ReleaseMaturity = (typeof RELEASE_MATURITY_STATES)[number];

type ProviderStatus = "fresh" | "stale" | "error" | "missing";

export type ProductProgressSignal = {
  label: string;
  status: "known" | "missing" | "attention";
  value: string;
};

export type ProductProgress = {
  stage: ProductStage;
  maturity: ReleaseMaturity;
  percent: number;
  blockers: string[];
  signals: ProductProgressSignal[];
};

type ProviderInput = {
  status: ProviderStatus;
  error: string | null;
  fetchedAt: Date | null;
};

type VercelInput = ProviderInput & {
  deploymentUrl: string | null;
  deploymentStatus: string | null;
};

export type ProductProgressInput = {
  projectStatus: "active" | "paused" | "archived";
  sprintDone: number;
  sprintTotal: number;
  sprintInProgress: number;
  sprintBlocked: number;
  sprintTodo: number;
  github: ProviderInput;
  vercel: VercelInput;
};

function providerLabel(provider: ProviderInput) {
  if (provider.status === "missing") {
    return "not linked";
  }
  if (provider.status === "error") {
    return provider.error ?? "error";
  }
  return provider.status;
}
function scoreProvider(provider: ProviderInput, weight: number) {
  if (provider.status === "fresh") {
    return weight;
  }
  if (provider.status === "stale") {
    return Math.round(weight * 0.65);
  }
  if (provider.status === "error") {
    return Math.round(weight * 0.2);
  }
  return 0;
}

function stageFromPercent(percent: number, github: ProviderInput, vercel: VercelInput): ProductStage {
  let stageIndex = 0;
  if (percent >= 15) stageIndex = 1;
  if (percent >= 30) stageIndex = 2;
  if (percent >= 45) stageIndex = 3;
  if (percent >= 65) stageIndex = 4;
  if (percent >= 80) stageIndex = 5;
  if (percent >= 90) stageIndex = 6;

  if (github.status === "missing") {
    stageIndex = Math.min(stageIndex, 2);
  }
  if (vercel.status === "missing" || vercel.status === "error" || !vercel.deploymentStatus) {
    stageIndex = Math.min(stageIndex, 3);
  }

  return PRODUCT_STAGES[stageIndex];
}

function maturityFromSignals(percent: number, input: ProductProgressInput): ReleaseMaturity {
  const deployed = input.vercel.status === "fresh" && Boolean(input.vercel.deploymentStatus);
  const sprintRatio = input.sprintTotal > 0 ? input.sprintDone / input.sprintTotal : 0;
  const hasBuildActivity = input.sprintDone + input.sprintInProgress > 0;

  if (deployed && percent >= 90 && input.sprintBlocked === 0) {
    return "Full Release";
  }
  if (deployed && sprintRatio >= 0.75) {
    return "MVP";
  }
  if (input.github.status === "fresh" && (deployed || sprintRatio >= 0.6)) {
    return "Beta";
  }
  if (hasBuildActivity || input.github.status !== "missing") {
    return "Alpha";
  }
  return "Internal";
}

export function computeProductProgress(input: ProductProgressInput): ProductProgress {
  const blockers: string[] = [];
  const sprintRatio = input.sprintTotal > 0 ? input.sprintDone / input.sprintTotal : 0;
  const taskStateScore =
    input.sprintTotal === 0
      ? 0
      : input.sprintBlocked > 0
        ? 5
        : input.sprintInProgress > 0
          ? 11
          : input.sprintTodo > 0
            ? 8
            : 15;

  if (input.sprintTotal === 0) {
    blockers.push("No open sprint tasks");
  }
  if (input.sprintBlocked > 0) {
    blockers.push(`${input.sprintBlocked} blocked sprint task${input.sprintBlocked === 1 ? "" : "s"}`);
  }
  if (input.github.status === "missing") {
    blockers.push("GitHub is not linked");
  } else if (input.github.status === "error") {
    blockers.push(`GitHub error: ${input.github.error ?? "refresh failed"}`);
  } else if (input.github.status === "stale") {
    blockers.push("GitHub snapshot is stale");
  }
  if (input.vercel.status === "missing") {
    blockers.push("Vercel is not linked");
  } else if (input.vercel.status === "error") {
    blockers.push(`Vercel error: ${input.vercel.error ?? "refresh failed"}`);
  } else if (!input.vercel.deploymentStatus) {
    blockers.push("No deployment snapshot");
  } else if (input.vercel.status === "stale") {
    blockers.push("Vercel snapshot is stale");
  }
  if (input.projectStatus === "paused") {
    blockers.push("Project is paused");
  }

  const sprintScore = Math.round(sprintRatio * 40);
  const githubScore = scoreProvider(input.github, 20);
  const deploymentScore =
    input.vercel.status === "fresh" && input.vercel.deploymentStatus
      ? 25
      : input.vercel.deploymentStatus
        ? scoreProvider(input.vercel, 25)
        : Math.round(scoreProvider(input.vercel, 25) * 0.6);
  const percent = Math.max(0, Math.min(100, sprintScore + taskStateScore + githubScore + deploymentScore));

  return {
    stage: stageFromPercent(percent, input.github, input.vercel),
    maturity: maturityFromSignals(percent, input),
    percent,
    blockers,
    signals: [
      {
        label: "Sprint",
        status: input.sprintTotal > 0 ? "known" : "missing",
        value: input.sprintTotal > 0 ? `${input.sprintDone}/${input.sprintTotal}` : "missing",
      },
      {
        label: "Task state",
        status: input.sprintBlocked > 0 ? "attention" : input.sprintTotal > 0 ? "known" : "missing",
        value:
          input.sprintTotal > 0
            ? `${input.sprintInProgress} active, ${input.sprintBlocked} blocked`
            : "unknown",
      },
      {
        label: "GitHub",
        status: input.github.status === "fresh" ? "known" : input.github.status === "missing" ? "missing" : "attention",
        value: providerLabel(input.github),
      },
      {
        label: "Vercel",
        status:
          input.vercel.status === "fresh" && input.vercel.deploymentStatus
            ? "known"
            : input.vercel.status === "missing"
              ? "missing"
              : "attention",
        value: input.vercel.deploymentStatus ?? providerLabel(input.vercel),
      },
    ],
  };
}
