"""
Chat-related API routes
"""

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
import requests

from models.schemas import ChatRequest, ToolCallApprovalRequest
from services.chat_service import ChatService
from services.mcp_service import mcp_manager
from utils import OPENROUTER_API_KEY
import json
import asyncio

router = APIRouter()

@router.post("/chat_streaming")
async def chat_streaming(request: ChatRequest):
  """
  Chat endpoint with streaming support and optional MCP tools
  
  Args:
    request: ChatRequest with model_id, chat_history, and MCP settings
  
  Returns:
    Streaming response
  """
  # Get model data
  all_models = requests.get('https://openrouter.ai/api/v1/models').json()['data']
  model_data = next((m for m in all_models if m['id'] == request.model_id), None)
  
  if not model_data:
    return {"error": "Model not found"}
  
  chat_service = ChatService(request.model_id, model_data)
  messages = chat_service.prepare_messages(request.chat_history)
  
  # Check if any messages have PDFs
  has_pdf = any(msg.pdf for msg in request.chat_history)
  
  payload = chat_service.create_payload(
    messages,
    use_mcp=request.use_mcp,
    mcp_server_type=request.mcp_server_type,
    has_pdf=has_pdf
  )
  
  def event_generator():
    yield from chat_service.stream_response(
      payload,
      use_mcp=request.use_mcp,
      mcp_auto_approve=request.mcp_auto_approve,
      mcp_server_type=request.mcp_server_type
    )
  
  return StreamingResponse(event_generator(), media_type="application/stream+json")


@router.post("/mcp/approve_tool_calls_streaming")
async def approve_tool_calls_streaming(request: ToolCallApprovalRequest):
  """
  Execute approved tool calls and return streaming response
  
  Args:
    request: ToolCallApprovalRequest with tool_calls and approval status
  
  Returns:
    Streaming response with tool execution results
  """
  # Handle declined tool calls
  if not request.approved:
    def decline_generator():
      yield json.dumps({
        "choices": [{"delta": {"content": "Tool calls were declined by the user."}}]
      })
    return StreamingResponse(decline_generator(), media_type="application/stream+json")
  
  # Get model data and create service
  all_models = requests.get('https://openrouter.ai/api/v1/models').json()['data']
  model_data = next((m for m in all_models if m['id'] == request.model_id), None)
  
  if not model_data:
    return {"error": "Model not found"}
  
  chat_service = ChatService(request.model_id, model_data)
  
  # Execute approved tools and stream response (all logic in ChatService!)
  def event_generator():
    yield from chat_service.execute_approved_tools_streaming(
      request.tool_calls,
      request.chat_history,
      request.mcp_server_type
    )
  
  return StreamingResponse(event_generator(), media_type="application/stream+json")
