import os
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

from api.main import JarvisChatRequest, _generate_jarvis_reply, app


class ApiTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_health_reports_configuration_without_exposing_secrets(self):
        with patch.dict(
            os.environ,
            {
                "SUPABASE_URL": "https://example.supabase.co",
                "SUPABASE_SERVICE_ROLE_KEY": "server-only-secret",
                "GEMINI_API_KEY": "gemini-secret",
            },
        ):
            response = self.client.get("/api/health")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {
                "status": "ok",
                "supabase_configured": True,
                "gemini_configured": True,
                "model": "gemini-3.5-flash-lite",
            },
        )
        self.assertNotIn("secret", response.text)

    def test_jarvis_chat_validates_input(self):
        response = self.client.post("/api/jarvis/chat", json={"message": "  "})

        self.assertEqual(response.status_code, 422)

    def test_jarvis_chat_uses_backend_generator(self):
        with patch("api.main._generate_jarvis_reply", return_value="At your service."):
            response = self.client.post(
                "/api/jarvis/chat",
                json={
                    "message": "Assess current threats",
                    "context": {
                        "selected_adversary": "Thanos",
                        "missions": [
                            {
                                "name": "Operation Infinity",
                                "villain": "Thanos",
                                "location": "New York",
                                "threat_level": "Critical",
                                "status": "Pending",
                            }
                        ],
                    },
                },
            )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {"reply": "At your service.", "model": "gemini-3.5-flash-lite"},
        )

    def test_jarvis_chat_normalizes_uppercase_threat_from_frontend(self):
        with patch("api.main._generate_jarvis_reply", return_value="Threat assessment ready."):
            response = self.client.post(
                "/api/jarvis/chat",
                json={
                    "message": "Assess current threats",
                    "context": {
                        "missions": [
                            {
                                "name": "Operation Infinity",
                                "villain": "Thanos",
                                "location": "New York",
                                "threat_level": "CRITICAL",
                                "status": "Pending",
                            }
                        ]
                    },
                },
            )

        self.assertEqual(response.status_code, 200)

    def test_gemini_request_uses_configured_flash_lite_model(self):
        client = unittest.mock.MagicMock()
        client.models.generate_content.return_value.text = "Threat assessment ready."
        request = JarvisChatRequest(message="Assess the threat")

        with patch("api.main._gemini_client", return_value=client):
            reply = _generate_jarvis_reply(request)

        self.assertEqual(reply, "Threat assessment ready.")
        self.assertEqual(
            client.models.generate_content.call_args.kwargs["model"],
            "gemini-3.5-flash-lite",
        )

    def test_create_team_rejects_duplicate_hero_ids(self):
        hero_id = "00000000-0000-0000-0000-000000000001"
        response = self.client.post(
            "/api/teams",
            json={
                "name": "Avengers Alpha",
                "hero_ids": [
                    hero_id,
                    hero_id,
                    "00000000-0000-0000-0000-000000000002",
                    "00000000-0000-0000-0000-000000000003",
                ],
            },
        )

        self.assertEqual(response.status_code, 422)

    def test_create_team_rejects_blank_names(self):
        response = self.client.post(
            "/api/teams",
            json={
                "name": "   ",
                "hero_ids": [
                    "00000000-0000-0000-0000-000000000001",
                    "00000000-0000-0000-0000-000000000002",
                    "00000000-0000-0000-0000-000000000003",
                    "00000000-0000-0000-0000-000000000004",
                ],
            },
        )

        self.assertEqual(response.status_code, 422)

    def test_database_routes_require_server_credentials(self):
        with patch.dict(
            os.environ,
            {"SUPABASE_URL": "", "SUPABASE_SERVICE_ROLE_KEY": ""},
        ):
            response = self.client.get("/api/heroes")

        self.assertEqual(response.status_code, 503)
        self.assertIn("SUPABASE_SERVICE_ROLE_KEY", response.json()["detail"])


if __name__ == "__main__":
    unittest.main()
