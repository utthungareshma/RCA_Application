


from scripts import XAI
import numpy as np
import pandas as pd
from lightgbm import LGBMRegressor
from sklearn.model_selection import train_test_split
from lime import lime_tabular

from joblib import load

def whatif_reg(mdl_path, pred, d):
    # Load the saved model from the provided path
    mdl = load(mdl_path)
    
    for i in d.keys():
        pred[i] = d[i]
    y_pred = mdl.predict(np.array(pred.loc[pred.index]).reshape(1,-1))
    #print(y_pred)

    return np.round(y_pred[0],2)

def whatif_clf(mdl_path, pred, d):
    # Load the saved model from the provided path
    mdl = load(mdl_path)
    
    for i in d.keys():
        pred[i] = d[i]
    y_pred = mdl.predict(np.array(pred.loc[pred.index]).reshape(1,-1))

    return y_pred[0]

def whatif(typ, mdl_path, pred, d):
    '''
    Parameters
    ----------
    typ : string
        Problem type - regression/classification.
    mdl_path : str
        Path to the saved ML model.
    pred : Pandas series
        Selected Record data returned by XAI (X_pred)
    d : Dictionary
        Dictionary of all variables and their changed values.

    Returns
    -------
    pred : int
        Predicted value after changed parameters.

    '''
    if typ == 'regression':
        pred_value = whatif_reg(mdl_path, pred, d)
    elif typ == 'classification':
        pred_value = whatif_clf(mdl_path, pred, d)
    
    return pred_value
