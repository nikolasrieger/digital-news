from google.generativeai import configure, GenerativeModel, GenerationConfig


class Model:
    def __init__(self, api_key: str):
        configure(api_key=api_key)
        self.__model = GenerativeModel("gemini-1.5-flash")

    def generate_expression(self, sentence: str):
        res = self.__model.generate_content(
            "You are a news reporter. You are reporting on a news story. Do not oversell it."
            + f"Return a matching facial expression and animation for this sentence: {sentence}."
            + "You can choose a facial expression from: smile, sad, angry, surprised, funnyFace, and default"
            + "and an animation from: Idle, TalkingOne, TalkingTwo, SadIdle, Defeated, Angry, Surprised, DismissingGesture, and ThoughtfulHeadShake."
            + "Return a JSON in the following format: {'facialExpression': str, 'animation': str}",
            generation_config=GenerationConfig(response_mime_type="application/json"),
        )
        return res.text

    def generate_summary(self, article: str):
        res = self.__model.generate_content(
            f"Write a summary for this article in the same language. Make it interesting and engaging while keeping the main points: {article}"
        )
        return res.text
