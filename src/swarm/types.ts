// Filename: ./swarm/types.ts

/**
 * Represents a function that an agent can perform.
 */

export interface ParameterSchema {
  type: string;
  required: boolean;
  description: string;
  items?: ParameterSchema; // For array types
  properties?: Record<string, ParameterSchema>; // For object types
  enum?: any[]; // For enumerated values
}

export interface FunctionDescriptor {
  name: string;
  description: string;
  parameters: Record<string, ParameterSchema>;
}

export interface AgentFunction {
  env: Env;
  [x: string]: any;
  name: string;
  func: (
    args: Record<string, any>
  ) =>
    | string
    | Agent
    | Record<string, any>
    | Promise<string | Agent | Record<string, any>>;
  descriptor: FunctionDescriptor;
}



/**
 * Represents an agent interacting with the Swarm.
 */
export class Agent {
  env: Env;
  name: string;
  model: string;
  instructions: string | ((contextVariables: Record<string, any>) => string);
  functions: AgentFunction[];
  tool_choice?: string;
  parallel_tool_calls: boolean;

  constructor(params: Partial<Agent> = {}) {
    this.env = params.env!;
    this.name = params.name || "Agent";
    this.model = params.model || "gpt-4o";
    this.instructions = params.instructions || "You are a helpful agent.";
    this.functions = params.functions || [];
    this.tool_choice = params.tool_choice;
    this.parallel_tool_calls =
      params.parallel_tool_calls !== undefined
        ? params.parallel_tool_calls
        : true;
  }
}

/**
 * Represents the response from the Swarm.
 */
export class Response {
  messages: Array<any>;
  agent?: Agent;
  context_variables: Record<string, any>;

  constructor(params: Partial<Response> = {}) {
    this.messages = params.messages || [];
    this.agent = params.agent;
    this.context_variables = params.context_variables || {};
  }
}

/**
 * Represents the result of a function executed by an agent.
 */

export class Result {
  value: string;
  agent?: Agent;
  context_variables: Record<string, any>;
  env: Env;

  constructor(params: Partial<Result> = {}) {
    this.value = params.value || "";
    this.agent = params.agent;
    this.context_variables = params.context_variables || {};
    this.env = params.env!;

    const f: AgentFunction = {
      env: this.env,
      name: "",
      func: function (args: Record<string, any>):
        | string
        | Agent
        | Record<string, any> // examconst cats: CatList = {miffy: { age:99 },boris: { age:16 },mordred: { age:600 }}
        | Promise<string | Agent | Record<string, any>> {
        console.log("Scaper says ");
        return "";
      },
      descriptor: {
        name: "",
        description: "",
        parameters: {},
      },
    };
  }
}

/**
 * Represents a function callable by the agent.
 */
export class ToolFunction {
  arguments: string;
  name: string;

  constructor(params: Partial<ToolFunction> = {}) {
    this.arguments = params.arguments || "";
    this.name = params.name || "";
  }
}
