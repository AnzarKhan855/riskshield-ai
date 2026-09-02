export type NodeType =
  | "MERCHANT"
  | "CUSTOMER"
  | "DEVICE"
  | "TRANSACTION"
  | "DECISION"
  | "CASE"
  | "IP_ADDRESS"
  | "CARD_BIN"
  | "COUNTRY"
  | "PAYMENT_METHOD";

export type RelationshipType =
  | "OWNS"
  | "MADE"
  | "USED_FOR"
  | "GENERATED"
  | "CREATED"
  | "USED"
  | "CONNECTED_TO"
  | "LOCATED_IN"
  | "CONNECTED_FROM";

export type GraphNode = GraphNodeRecord;

export interface GraphNodeRecord {
  id: string;
  label: string;
  type: NodeType;
  risk_score: number;
  risk_level: string; // LOW, MEDIUM, HIGH, CRITICAL
  metadata: Record<string, any>;
  icon?: string;
}

export interface GraphEdgeRecord {
  id: string;
  source: string;
  target: string;
  relationship: RelationshipType;
  label: string;
  weight: number;
  metadata: Record<string, any>;
}

export interface GraphPayloadData {
  nodes: GraphNodeRecord[];
  edges: GraphEdgeRecord[];
  total_nodes: number;
  total_edges: number;
}

export interface GraphFilterParams {
  limit?: number;
  node_type?: string;
  relationship?: string;
}
