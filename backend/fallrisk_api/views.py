import joblib
import numpy as np
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
import os

# Percorsi relativi
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, 'fallrisk_pipeline.pkl')
RANGE_PATH = os.path.join(BASE_DIR, 'ranges_fallers_top10.json')

# Carica pipeline e range interpretativi
pipeline = joblib.load(MODEL_PATH)
with open(RANGE_PATH, 'r') as f:
    ranges = json.load(f)

@csrf_exempt
def predict_fall_risk(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body.decode('utf-8'))
            input_features = [
                'hr_v', '%det_v', '%det_ml', '%det_ap', 'weigth',
                'age_onset', 'duration_years', 'ledd', 'updrs-ii', 'updrs-iii'
            ]
            X = np.array([float(data[feature]) for feature in input_features]).reshape(1, -1)
            prediction = pipeline.predict(X)[0]
            prob = pipeline.predict_proba(X)[0][1]  # probabilità classe 1

            return JsonResponse({
                'prediction': int(prediction),
                'probability_fallers': round(prob, 3)
            })
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    return JsonResponse({'message': 'Only POST requests allowed'}, status=405)

def get_feature_ranges(request):
    return JsonResponse(ranges, safe=False)