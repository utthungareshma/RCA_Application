from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.core.files.storage import FileSystemStorage
import os
from .helpers import load_file
from scripts.gb_deviation import sel_batch_compare_with_gb
from scripts.causal_graph import causal_analysis, causal_strengthPlot, plot_causal_strength
from scripts.XAI import XAI
import pandas as pd
from scripts.What_if import whatif
import base64

# from rest_framework.decorators import api_view, permission_classes
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.response import Response

# Create your views here.

# Upload File API
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_file(request):

    if 'file' not in request.FILES:
        return Response({'error': 'No file was uploaded'}, status=status.HTTP_400_BAD_REQUEST)
    
    uploaded_files = request.FILES.getlist('file')

    #  check for dir
    file_dir = os.path.isdir('dataFiles')

    # create new dir
    if not file_dir:
        os.mkdir('dataFiles')

    file_paths = []
    duplicate_files = []
    storage = FileSystemStorage()

    for f in uploaded_files:
        file_name = f.name
        file_path = f'dataFiles/{file_name}'

        if storage.exists(file_path):
            duplicate_files.append(file_name)
            continue

        try:
            file_path = storage.save(file_path, f)   # filename and file
            file_paths.append(file_path)
        except:
            return Response({'error': f'Error saving file {f.name}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    if not file_paths:
        return Response({'error': 'No files were saved'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    if duplicate_files:
        message = f'Duplicate file(s) {", ".join(duplicate_files)} were not saved.'
        return Response({'success': f'Successfully uploaded {len(file_paths)} file(s)', 'warning': message})
    else:
        return Response({'success': f'Successfully uploaded {len(file_paths)} file(s)'})

# Previously stored files
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_file_list(request):
    try:
        storage = FileSystemStorage(location='dataFiles')   # fileLocation
        file_list = storage.listdir('')[1]
        return Response({'data':file_list}, status=status.HTTP_200_OK)
    except Exception:
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

# Get Columns from CSV
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_column_headers(request):
    try:
        file = request.data.get('file_name')

        if not file:
            return Response({'error': 'No file name selected'}, status=status.HTTP_400_BAD_REQUEST)
        file_path = f'dataFiles/{file}'

        storage_dir = FileSystemStorage()

        if not storage_dir.exists(file_path):
            return Response({'error':'Selected file not found'}, status=status.HTTP_404_NOT_FOUND)
        
        extracted_data = load_file(file_path)
        column_headers = list(extracted_data.columns)
   
        return Response({'data':column_headers},status=status.HTTP_200_OK)
    except Exception:
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    
# Get Column Value  -- batch IDs
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_column_values(request):
    try:
        file_name = request.data.get('file_name')
        column_name = request.data.get('column_name')
        row_index = request.data.get('row_index')

        if not file_name:
            return Response({'error': 'No file name selected'}, status=status.HTTP_400_BAD_REQUEST)
        file_path = f'dataFiles/{file_name}'

        storage_dir = FileSystemStorage()

        if not storage_dir.exists(file_path):
            return Response({'error':'Selected file not found'}, status=status.HTTP_404_NOT_FOUND)
        
        df = load_file(file_path)

        if row_index:
            column_values = df.loc[row_index-2, column_name]
        else:
            column_values = df[column_name].unique()
    
        return Response({'data':column_values}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"ERROR":str(e)},status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
# get batch id's --> Dashboard 2
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_batches(request):
    try:
        file_path = 'dataFiles/BioreactorData.csv'
        column_name = 'Batch reference(Batch_ref:Batch ref)'

        storage_dir = FileSystemStorage()

        if not storage_dir.exists(file_path):
            return Response({'error':'Selected file not found'}, status=status.HTTP_404_NOT_FOUND)
        
        extracted_data = load_file(file_path)
        column_values = extracted_data[column_name].unique()
    
        return Response({'data':column_values}, status=status.HTTP_200_OK)
    except Exception:
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

# get Index
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_index(request):
    try:
        file_name = request.data.get('file_name')
        # column_name = request.data.get('column_name')
        # file_path = 'dataFiles/BioreactorData.csv'
        column_name = 'Batch reference(Batch_ref:Batch ref)'
        batch_id = request.data.get('batch_id')

        if not file_name:
            return Response({'error': 'No file name selected'}, status=status.HTTP_400_BAD_REQUEST)
        file_path = f'dataFiles/{file_name}'

        storage_dir = FileSystemStorage()

        if not storage_dir.exists(file_path):
            return Response({'error':'Selected file not found'}, status=status.HTTP_404_NOT_FOUND)
        
        df = load_file(file_path)
        # condition = extracted_dataFrame[column_name] == batch_id
        # filtered_df = extracted_dataFrame[condition]

        if batch_id:
            condition = df[column_name] == batch_id
            filtered_df = df[condition]
            index_numbers = (filtered_df.index + 2).tolist()
        else:
            index_numbers = (df.index + 2).tolist()
        
        # condition = df[column_name] == batch_id
        # filtered_df = df[condition]
        # index_numbers = (filtered_df.index + 2).tolist()
        
        return Response({'data':index_numbers}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"error":str(e)},status=status.HTTP_500_INTERNAL_SERVER_ERROR)


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import pandas as pd

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def compare_batch_with_gb(request):
    try:
        if 'file_name' not in request.data:
            return Response({'error': 'No file was Selected'}, status=status.HTTP_400_BAD_REQUEST)
        
        file_name = request.data.get("file_name")
        batch_id = request.data.get('batch_id')
        cqa = request.data.get('cqa')
        cqa_threshold = request.data.get('cqa_threshold')
        cpp_list = request.data.get('cpp_list')
        batch_column = request.data.get('batch_column')
        time_column = request.data.get('time_column')
        
        file_path = f'dataFiles/{file_name}'
        df = pd.read_csv(file_path)

        # Calculate min and max range of cqa
        cqa_min = df[cqa].min()
        cqa_max = df[cqa].max()
        cqa_range = {"min": cqa_min, "max": cqa_max}

        index_list, time_list, cqa_batch_list, cqa_gb_list, cqa_deviation, df_cpp_deviation, df_cpp_drill_down, time_step = sel_batch_compare_with_gb(file_path, batch_id, cqa, cqa_threshold, cpp_list, batch_column, time_column)
        
        response_data = {
            'index_list': index_list,
            'time_list': time_list,
            'cqa_batch_list': cqa_batch_list,
            'cqa_gb_list': cqa_gb_list,
            'cqa_deviation': cqa_deviation,
            'df_cpp_deviation': df_cpp_deviation,
            'df_cpp_drill_down': df_cpp_drill_down,
            'time_step': time_step,
            'cqa_range': cqa_range  # Added the cqa_range to response data
        }
        
        return Response(response_data, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({"Error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)





# CAUSAL GRAPH
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def causal_graph_analysis(request):
    if 'file_name' not in request.data:
        return Response({'error': 'No file was uploaded'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        file_name = request.data.get("file_name")
        selected_batch = request.data.get('selected_batch')
        treatment_vars = request.data.get('treatment_list')
        common_causes = request.data.get('common_causes')
        target_var = request.data.get('target_var')
        causal_target = request.data.get('causal_target')
        estimate_method = request.data.get('estimate_method')
        refute_method = request.data.get('refute_method')

        file_path = f'dataFiles/{file_name}'
        data = load_file(file_path)
        
        select_batch = data
        
        if selected_batch:
            select_batch = data[data['Batch reference(Batch_ref:Batch ref)'] == selected_batch ]
            
        # calling causal analysis and plot_causal_strength function
        strength, entities = causal_analysis(select_batch, treatment_vars, common_causes, target_var, causal_target, estimate_method, refute_method )
        # causal_html = plot_causal_strength(strength,causal_target)
        causal_plot = causal_strengthPlot(strength,causal_target)

        result_dict = {}
        for entity in entities:
            if entity:
                key, value = entity.split(':')
                formatted_key = key.replace(" ", "_").lower()
                # result_dict[formatted_key] = value.strip()
                try:
                    value = float(value)
                    result_dict[formatted_key] = f'{value:.5f}' 
                except ValueError:
                    result_dict[formatted_key] = value
            
        data_dict = {}    
        data_dict['data'] = result_dict
        data_dict['plot'] = causal_plot
        # data_dict['causal_html'] = causal_html
        
        return Response(data_dict, status=status.HTTP_200_OK)
    except Exception as e:
         return Response({"Error":str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    

import numpy as np
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import base64
import pickle
from io import BytesIO
import pandas as pd
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def xai_view(request):
    required_fields = ["project", "typ", "batch", "target", "ip", "index", "num_ft"]
    for field in required_fields:
        if field not in request.data:
            return Response({"status": "error", "message": f"Missing field: {field}"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        project = request.data.get("project")
        typ = request.data.get("typ")
        batch = int(request.data.get("batch"))
        target = request.data.get("target")
        ip = request.data.get("ip")
        index = int(request.data.get("index"))
        num_ft = int(request.data.get("num_ft"))

        exp, mdl, X_pred, val, feat,var, X_pred_list = XAI(project, typ, batch, target, ip, index, num_ft)
        #print("================", X_pred)

        # Calculate the prediction
        # pred=mdl.predict_proba(np.array(X_pred).reshape(1,-1))
        if typ == "classification":
            pred_values = mdl.predict_proba(np.array(X_pred).reshape(1,-1))[0] 
            pred1 = pred_values[0]
            pred2 = pred_values[1]
            # pred = mdl.predict_proba(np.array(X_pred).reshape(1,-1))
        elif typ == "regression":
            pred_values = mdl.predict(np.array(X_pred).reshape(1,-1))
            pred2 = ''
            pred1 = ''
        else:
            return Response({"status": "error", "message": "Invalid 'typ' provided. Must be either 'classification' or 'regression'."}, status=status.HTTP_400_BAD_REQUEST)
        x_pred_dict = X_pred.to_dict()
        # Convert explanations to a more friendly format
        explanations = [{"feature": item[0], "impact": float(item[1])} for item in exp.as_list()]

        return Response({
            "status": "success",
            "data": {
                "features": feat.to_dict(orient="records"),
                "Disagree": pred1,
                "Normal": pred2,
                "prediction":pred_values[0],

                "mdl":str(mdl),
                "var":str(var),

                "X_pred":x_pred_dict,
                "actual_value": float(val),
                "explanations": explanations,
                "X_pred_list": X_pred_list
            }
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({"status": "error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)










from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import pandas as pd
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import pandas as pd
import os

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def whatif_view(request):
    required_fields = ["typ", "pred", "d"]
    
    for field in required_fields:
        if field not in request.data:
            return Response({"status": "error", "message": f"Missing field: {field}"}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        typ = request.data.get("typ")
        # Hard code the model path
        mdl_path = "trained_model.pkl"
        
        # Ensure the path is absolute and correct
        mdl_path = os.path.abspath(mdl_path)

        pred = pd.Series(request.data.get("pred"))
        d = request.data.get("d")

        # Calculate the prediction using whatif function
        prediction = whatif(typ, mdl_path, pred, d)

        return Response({
            "status": "success",
            "data": {
                "prediction": prediction,
            }
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({"status": "error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)





from django.core.files.storage import FileSystemStorage
import pandas as pd
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response









bio_cols={'Time (h)':'Time','Aeration rate(Fg:L/h)':'Aeration rate','Agitator RPM(RPM:RPM)':'Agitator RPM',
            'Sugar feed rate(Fs:L/h)':'Sugar Rate','Acid flow rate(Fa:L/h)':'Acid Rate','Base flow rate(Fb:L/h)':'Base Rate',
            'Heating/cooling water flow rate(Fc:L/h)':'Heat/Cool Rate','Water for injection/dilution(Fw:L/h)':'Water for Inject/Dilute',
            'PAA flow(Fpaa:PAA flow (L/h))':'PAA flow','pH(pH:pH)':'pH','Temperature(T:K)':'Temperature',
            'Dissolved oxygen concentration(DO2:mg/L)':'Dissolved Oxygen Concentration',
            'Oxygen Uptake Rate(OUR:(g min^{-1}))':'Oxygen Uptake Rate','Oxygen in percent in off-gas(O2:O2  (%))':'o2 percent in off-gas',
            'carbon dioxide percent in off-gas(CO2outgas:%)':'CO2 percent in off-gas','Generated heat(Q:kJ)':'Generated Heat',
            'Vessel Volume(V:L)':'Vessel Volume','Vessel Weight(Wt:Kg)':'Vessel Weight','Ammonia shots(NH3_shots:kgs)':'NH3 Shots',
            'Oil flow(Foil:L/hr)':'Oil flow','Carbon evolution rate(CER:g/h)':'Carbon Evolution Rate','Fault reference(Fault_ref:Fault ref)':'Fault Ref',
            'Penicillin concentration(P:g/L)':'Penicillin concentration','Batch reference(Batch_ref:Batch ref)':'Batch Ref'}


synres_cols= {'TE18901 (degC)':'TE18901','TE18902 (degC)':'TE18902','TE18905 (degC)':'TE18905','TE18955 (degC)':'TE18955',
              'TE18912 (degC)':'TE18912','TE18913 (degC)':'TE18913','FIT18910 (l/h)':'FIT18910','FT18930 (m3/h)':'FT18930',
              'PT18950 (Barg)':'PT18950','SI18940 (rpm)':'SI18940','NI18940 (pct)':'NI18940','AT18965 (mPa.s)':'AT18965',
              'TT18920 (degC)':'TT18920','LT18915 (%)':'LT18915','PT18921 (Barg)':'PT18921','TE18950 (degC)':'TE18950', 
              'TE18951 (degC)':'TE18951'}


PROJECT_TO_FILE_MAPPING = {
    'BioreactorData.csv': 'dataFiles/BioreactorData.csv',
    'synres': 'dataFiles/synres_dataset.csv'
}

combined_cols = {**bio_cols, **synres_cols}
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_column_ranges(request):
    try:
        # Extract the project name from the POST request
        project_name = request.data.get('project')
        if not project_name:
            return Response({'error': 'Project name not provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        file_path = PROJECT_TO_FILE_MAPPING.get(project_name)
        if not file_path:
            return Response({'error': f'Invalid project name "{project_name}"'}, status=status.HTTP_400_BAD_REQUEST)

        storage_dir = FileSystemStorage()
        if not storage_dir.exists(file_path):
            return Response({'error': 'Selected file not found'}, status=status.HTTP_404_NOT_FOUND)
        
        df = pd.read_csv(file_path)
        
        # Extract the column names from the POST request
        column_names = request.data.get('column_names', [])
        column_ranges_dict = {}

        for column_name in column_names:
            # Check if the column exists in the dataframe
            if column_name not in df.columns:
                return Response({'error': f'Column "{column_name}" not found in the dataset'}, status=status.HTTP_400_BAD_REQUEST)

            # Get range for the specific column
            min_val, max_val = column_range(df, column_name)
            
            # Check if the column name should be renamed
            simplified_name = combined_cols.get(column_name, column_name)
            column_ranges_dict[simplified_name] = {'min': min_val, 'max': max_val}

        return Response(column_ranges_dict, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def column_range(df, column_name):
    if pd.api.types.is_numeric_dtype(df[column_name]):
        return df[column_name].min(), df[column_name].max()
    return