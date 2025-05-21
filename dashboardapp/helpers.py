import os
import pandas as pd

def load_file(file_path: str):
    ''' Load file csv | excel | parquet '''
    
    _, file_extension = os.path.splitext(file_path)
    if (file_extension=='.csv'):
        data = pd.read_csv(file_path)
    elif (file_extension==".xls" or file_extension=='.xlsx'):
        data = pd.read_excel(file_path, engine='openpyxl')
    else:
        data = pd.read_parquet(file_path)
    return data