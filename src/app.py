import os
import subprocess
from gtts import gTTS
from flask import Flask, jsonify, Response
from flask_cors import CORS
import base64
import json
import time

app = Flask(__name__)
CORS(app)

class LipSync:
    def __convert_text_to_audio(self, sentence, audio_file: str):
        tts = gTTS(sentence, tld='co.uk', lang='en')
        tts.save(audio_file)

    def __generate_lip_sync(self, audio_file: str, output_file: str):
        ffmpeg_path = os.path.abspath("./lib/ffmpeg/bin/ffmpeg")
        rhubarb_path = os.path.abspath("./lib/rhubarb-lip-sync/rhubarb")

        command = f'"{ffmpeg_path}" -y -i {audio_file} audio.wav'
        subprocess.run(command, shell=True, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

        command = f'"{rhubarb_path}" -f json -o {output_file} audio.wav -r phonetic'
        subprocess.run(command, shell=True, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    def run_lip_sync(self, sentence, audio_file: str = "audio.mp3", output_file: str = "output.json"):
        self.__convert_text_to_audio(sentence, audio_file)
        self.__generate_lip_sync(audio_file, output_file)

        with open(output_file, 'r') as f:
            lipsync_data = json.load(f)
        
        with open(audio_file, "rb") as audio_file:
            audio_base64 = base64.b64encode(audio_file.read()).decode('utf-8')
        
        return audio_base64, lipsync_data


@app.route("/generate_lip_sync", methods=["GET"])
def generate_lip_sync():
    try:
        text = """Switzerland and Italy have redrawn part of their border in the Alps due to melting glaciers, caused by climate change.
            Part of the area affected will be beneath the Matterhorn, one of Europe's tallest mountains, and close to a number of popular ski resorts.
            Large sections of the Swiss-Italian border are determined by glacier ridgelines or areas of perpetual snow, but melting glaciers have caused these natural boundaries to shift, leading to both countries seeking to rectify the border."""

        sentences = [sentence.strip() for sentence in text.split(".") if sentence.strip()]

        def generate_lip_sync_stream():
            ticker = 0
            lipsync_generator = LipSync()
            facial_expression = "neutral"

            for sentence in sentences:
                audio_base64, lipsync_data = lipsync_generator.run_lip_sync(sentence + ".")
                animation = "Idle" if ticker == 1 else "TalkingTwo"
                ticker = 1 - ticker

                response = {
                    "text": sentence,
                    "facialExpression": facial_expression,
                    "animation": animation,
                    "audio": f"data:audio/mp3;base64,{audio_base64}",
                    "lipsync": lipsync_data,
                }

                yield f"data: {json.dumps(response)}\n\n"
                time.sleep(1) 

        return Response(generate_lip_sync_stream(), mimetype='text/event-stream')

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
