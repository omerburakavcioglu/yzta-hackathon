from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    supabase_url: str
    supabase_service_role_key: str
    openai_api_key: str = ""
    gemini_api_key: str = ""
    llm_provider: str = "openai"

    class Config:
        # Load local overrides during development without requiring file renames.
        env_file = (".env", ".env.local")


settings = Settings()
