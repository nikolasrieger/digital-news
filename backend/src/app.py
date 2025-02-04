from os import path, remove, getenv
from subprocess import run, DEVNULL
from gtts import gTTS
from flask import Flask, jsonify, Response, request
from flask_cors import CORS
from json import load, dumps, loads
from base64 import b64encode
from time import sleep
from model import Model
from dotenv import load_dotenv
from requests import get

app = Flask(__name__)
CORS(app)


class LipSync:
    def __convert_text_to_audio(self, sentence, audio_file: str):
        tts = gTTS(sentence, tld="co.uk", lang="en")
        tts.save(audio_file)

    def __generate_lip_sync(self, audio_file: str, output_file: str):
        ffmpeg_path = path.abspath("./lib/ffmpeg/bin/ffmpeg")
        rhubarb_path = path.abspath("./lib/rhubarb-lip-sync/rhubarb")

        command = f'"{ffmpeg_path}" -y -i {audio_file} audio.wav'
        run(command, shell=True, check=True, stdout=DEVNULL, stderr=DEVNULL)

        command = f'"{rhubarb_path}" -f json -o {output_file} audio.wav -r phonetic'
        run(command, shell=True, check=True, stdout=DEVNULL, stderr=DEVNULL)

    def run_lip_sync(
        self, sentence, audio_file: str = "audio.mp3", output_file: str = "output.json"
    ):
        self.__convert_text_to_audio(sentence, audio_file)
        self.__generate_lip_sync(audio_file, output_file)

        with open(output_file, "r") as f:
            lipsync_data = load(f)

        with open(audio_file, "rb") as audio_file:
            audio_base64 = b64encode(audio_file.read()).decode("utf-8")

        return audio_base64, lipsync_data
    

@app.route("/generate_lip_sync", methods=["GET"])
def generate_lip_sync():
    #try:
    if True:
        url = request.args.get("url")

        if not url:
            return jsonify({"error": "URL parameter is required"}), 400

        response = get(url)

        if response.status_code != 200:
            return jsonify({"error": "Failed to fetch the content from the URL"}), 400

        text = response.text
        text = model.generate_summary(text)

        sentences = [sentence.strip() for sentence in text.split(".") if sentence.strip()]

        def generate_lip_sync_stream():
            ticker = 0
            lipsync_generator = LipSync()

            for sentence in sentences:
                audio_base64, lipsync_data = lipsync_generator.run_lip_sync(sentence + ".")
                
                expr = loads(model.generate_expression(sentence))
                animation = expr["animation"]
                facial_expression = expr["facialExpression"]
                
                ticker = 1 - ticker

                response = {
                    "text": sentence,
                    "facialExpression": facial_expression,
                    "animation": animation,
                    "audio": f"data:audio/mp3;base64,{audio_base64}",
                    "lipsync": lipsync_data,
                }
                yield f"data: {dumps(response)}\n\n"

                remove("audio.mp3")
                remove("audio.wav")
                remove("output.json")
                sleep(1)

        return Response(generate_lip_sync_stream(), mimetype="text/event-stream")

    #except Exception as e:
    #    return jsonify({"error": str(e)}), 500



if __name__ == "__main__":
    load_dotenv()
    model = Model(getenv("GEMINI_API_KEY"))
    app.run(debug=True)
