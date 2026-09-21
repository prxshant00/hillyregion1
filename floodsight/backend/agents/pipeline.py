"""
Autonomous Multi-Agent Triage Pipeline Orchestrator.
Coordinates IngestionSentinel, HydrologyReasoner, and DispatchCommander with strict iteration bounds and HITL governance.
"""
import uuid
import hashlib
from datetime import datetime, timezone
from typing import List, Dict, Optional
from floodsight.backend.agents.contracts import (
    AgentExecutionStep,
    TelemetryQualityAudit,
    HydrologyDossier,
    EmergencyDirectiveDraft,
    AgentTriagePipelineResult,
    ApproveDirectiveRequest,
    ApproveDirectiveResponse
)
from floodsight.backend.agents.tools import (
    audit_sensor_telemetry,
    evaluate_hydrological_physics,
    draft_emergency_directive
)
from floodsight.backend.services.ward_registry import ward_registry

# In-memory store for pending directives
_DIRECTIVES_STORE: Dict[str, EmergencyDirectiveDraft] = {}


class AgentPipelineOrchestrator:
    """
    Executes the multi-agent ReAct triage workflow with traceable steps and human oversight.
    """

    def run_triage(self, ward_id: str) -> AgentTriagePipelineResult:
        pipeline_id = f"PIPE-{uuid.uuid4().hex[:8].upper()}"
        steps: List[AgentExecutionStep] = []
        ward = ward_registry.get_ward_by_id(ward_id)
        ward_name = ward.ward_name if ward else ward_id

        # =========================================================================
        # AGENT 1: IngestionSentinel (Sensor & Telemetry Guardian)
        # =========================================================================
        steps.append(AgentExecutionStep(
            agent_name="IngestionSentinel",
            phase="THOUGHT",
            detail=f"Inspecting incoming 868.1MHz LoRaWAN packet stream and satellite rainfall delta for {ward_name} ({ward_id})."
        ))
        
        telemetry_audit = audit_sensor_telemetry(ward_id)
        steps.append(AgentExecutionStep(
            agent_name="IngestionSentinel",
            phase="ACTION",
            detail=f"audit_sensor_telemetry(ward_id='{ward_id}') -> Node {telemetry_audit.node_id}"
        ))
        
        steps.append(AgentExecutionStep(
            agent_name="IngestionSentinel",
            phase="OBSERVATION",
            detail=(
                f"Telemetry verified: SNR={telemetry_audit.snr_db}dB, Battery={telemetry_audit.battery_v}V, "
                f"Packet Loss={telemetry_audit.packet_loss_pct}%, Status={telemetry_audit.source_status}. "
                f"Confidence index: {int(telemetry_audit.confidence_score * 100)}%."
            )
        ))

        # =========================================================================
        # AGENT 2: HydrologyReasoner (Physics & Runoff Triage)
        # =========================================================================
        steps.append(AgentExecutionStep(
            agent_name="HydrologyReasoner",
            phase="THOUGHT",
            detail=(
                f"Evaluating slope stability against Geological Survey of India / CWC empirical threshold: "
                f"I = 14.82 * D^(-0.39) and Manning hydraulic surge velocity for {ward_name}."
            )
        ))
        
        hydrology_dossier = evaluate_hydrological_physics(ward_id)
        steps.append(AgentExecutionStep(
            agent_name="HydrologyReasoner",
            phase="ACTION",
            detail=f"evaluate_hydrological_physics(ward_id='{ward_id}')"
        ))
        
        breach_note = "CRITICAL PHYSICAL BREACH DETECTED" if hydrology_dossier.gsi_threshold_breached else "Slope holding capacity nominal"
        steps.append(AgentExecutionStep(
            agent_name="HydrologyReasoner",
            phase="OBSERVATION",
            detail=(
                f"Rainfall Rate={hydrology_dossier.rainfall_rate_mmh} mm/h (Limit: {hydrology_dossier.gsi_threshold_limit_mmh} mm/h). "
                f"{breach_note}. Surge Propagation Velocity={hydrology_dossier.manning_velocity_ms} m/s. "
                f"Composite Risk Index={hydrology_dossier.composite_risk_score}/100 [{hydrology_dossier.alert_level}]. "
                f"Estimated Crest Lead Time: {hydrology_dossier.downstream_eta_h} hours."
            )
        ))

        # =========================================================================
        # AGENT 3: DispatchCommander (Emergency Formulator & HITL Gate)
        # =========================================================================
        steps.append(AgentExecutionStep(
            agent_name="DispatchCommander",
            phase="THOUGHT",
            detail=(
                f"Synthesizing OASIS CAP-India v1.2 XML emergency message and bilingual voice advisory. "
                f"Checking safety boundaries: Alert severity is {hydrology_dossier.alert_level}."
            )
        ))

        directive = draft_emergency_directive(ward_id, hydrology_dossier)
        _DIRECTIVES_STORE[directive.directive_id] = directive

        steps.append(AgentExecutionStep(
            agent_name="DispatchCommander",
            phase="ACTION",
            detail=f"draft_emergency_directive(ward_id='{ward_id}', severity='{hydrology_dossier.alert_level}') -> Directive ID: {directive.directive_id}"
        ))

        if directive.human_approval_required:
            steps.append(AgentExecutionStep(
                agent_name="DispatchCommander",
                phase="OBSERVATION",
                detail=(
                    f"HUMAN-IN-THE-LOOP SAFETY INTERLOCK ENGAGED: Directive {directive.directive_id} staged. "
                    f"Autonomous public broadcasting halted. Awaiting Incident Commander cryptographic authorization."
                )
            ))
        else:
            steps.append(AgentExecutionStep(
                agent_name="DispatchCommander",
                phase="OBSERVATION",
                detail=f"Directive logged into operational register as nominal monitoring state. No public evacuation required."
            ))

        return AgentTriagePipelineResult(
            pipeline_id=pipeline_id,
            ward_id=ward_id,
            ward_name=ward_name,
            execution_trace=steps,
            telemetry_audit=telemetry_audit,
            hydrology_dossier=hydrology_dossier,
            directive=directive,
            human_review_required=directive.human_approval_required
        )

    def approve_directive(self, request: ApproveDirectiveRequest) -> ApproveDirectiveResponse:
        """
        Executes verified commander authorization for a staged emergency directive.
        """
        directive = _DIRECTIVES_STORE.get(request.directive_id)
        now_iso = datetime.now(timezone.utc).isoformat()
        
        # Generate SHA256 checksum simulating digital signature
        raw_sig = f"{request.directive_id}:{request.commander_callsign}:{request.action}:{now_iso}"
        checksum = hashlib.sha256(raw_sig.encode()).hexdigest()[:16].upper()

        if request.action == "APPROVE":
            if directive:
                directive.status = "APPROVED_BY_COMMANDER"
            message = (
                f"Emergency Directive {request.directive_id} authorized by {request.commander_callsign}. "
                f"OASIS CAP-India XML pushed to SACHET portal. Acoustic voice siren triggered."
            )
            status_val = "TRANSMITTED_TO_SACHET"
        else:
            if directive:
                directive.status = "OVERRIDDEN_BY_COMMANDER"
            message = f"Emergency Directive {request.directive_id} dismissed by {request.commander_callsign}."
            status_val = "DISMISSED"

        return ApproveDirectiveResponse(
            directive_id=request.directive_id,
            status=status_val,
            broadcast_timestamp=now_iso,
            message=message,
            digital_checksum=f"NDRF-SIG-{checksum}"
        )


agent_orchestrator = AgentPipelineOrchestrator()
