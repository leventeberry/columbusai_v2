import type { VPSActionsApi, VPSDockerManagerApi } from "hostinger-api-sdk";
import { callApi, pollAction } from "./client";
import { buildDockerEnvironmentString } from "./docker-env";

export async function deployDockerProject(
  docker: VPSDockerManagerApi,
  actions: VPSActionsApi,
  virtualMachineId: number,
  projectName: string,
  githubComposeUrl: string
): Promise<void> {
  console.log(`Deploying Docker project "${projectName}" on VM ${virtualMachineId}...`);
  console.log(`  Compose source: ${githubComposeUrl}`);

  const environment = buildDockerEnvironmentString();
  const envLines = environment.split("\n").filter(Boolean);
  console.log(`  Injecting ${envLines.length} environment variables`);

  const action = await callApi(
    () =>
      docker.createNewProjectV1(virtualMachineId, {
        project_name: projectName,
        content: githubComposeUrl,
        environment: environment || undefined,
      }),
    "createNewProject"
  );

  if (action.id) {
    console.log(`  Waiting for deploy action ${action.id}...`);
    await pollAction(actions, virtualMachineId, action.id, {
      timeoutMs: 1_800_000,
    });
  }

  const projects = await callApi(
    () => docker.getProjectListV1(virtualMachineId),
    "getProjectList"
  );
  const project = projects.find((p) => p.name === projectName);
  if (project) {
    console.log(`  Project state: ${project.state} (${project.status})`);
  } else {
    console.warn(`  Project "${projectName}" not listed after deploy.`);
  }

  console.log("Docker deploy request completed.");
}

export async function printDockerProjectStatus(
  docker: VPSDockerManagerApi,
  virtualMachineId: number,
  projectName: string
): Promise<void> {
  const projects = await callApi(
    () => docker.getProjectListV1(virtualMachineId),
    "getProjectList"
  );
  const project = projects.find((p) => p.name === projectName);
  if (!project) {
    console.log(`No project named "${projectName}" on VM ${virtualMachineId}.`);
    return;
  }
  console.log(
    JSON.stringify(
      {
        name: project.name,
        state: project.state,
        status: project.status,
        path: project.path,
        containers: project.containers?.map((c) => ({
          name: c.name,
          state: c.state,
          health: c.health,
        })),
      },
      null,
      2
    )
  );
}

export async function printDockerProjectLogs(
  docker: VPSDockerManagerApi,
  virtualMachineId: number,
  projectName: string
): Promise<void> {
  const logs = await callApi(
    () => docker.getProjectLogsV1(virtualMachineId, projectName),
    "getProjectLogs"
  );
  for (const block of logs) {
    console.log(`\n=== ${block.service} ===`);
    for (const entry of block.entries ?? []) {
      console.log(`${entry.timestamp}  ${entry.line}`);
    }
  }
}
