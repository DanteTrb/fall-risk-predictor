from rest_framework.decorators import api_view
from rest_framework.response import Response
import joblib
import pandas as pd
import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'fallrisk_pipeline.pkl')
RANGE_PATH = os.path.join(BASE_DIR, 'ranges_fallers_top10.json')

pipeline = joblib.load(MODEL_PATH)
with open(RANGE_PATH, 'r') as f:
    ranges = json.load(f)

@api_view(['POST'])
def predict_fall_risk(request):
    try:
        data = request.data
        input_features = [
            'hr_v', '%det_v', '%det_ml', '%det_ap', 'weigth',
            'age_onset', 'duration_years', 'ledd', 'updrs-ii', 'updrs-iii'
        ]

        # ✅ Conversione sicura e corretta
        X = pd.DataFrame(
            [[float(data[feature]) for feature in input_features]],
            columns=input_features
        )

        prediction = pipeline.predict(X)[0]
        prob = pipeline.predict_proba(X)[0][1]

        return Response({
            'prediction': int(prediction),
            'probability_fallers': round(prob, 3)
        })
    except Exception as e:
        return Response({'error': str(e)}, status=400)

@api_view(['GET'])
def get_feature_ranges(request):
    return Response(ranges)