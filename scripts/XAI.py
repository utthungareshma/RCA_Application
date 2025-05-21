import numpy as np
import pandas as pd
import re
from lightgbm import LGBMRegressor
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from lightgbm import LGBMClassifier
import matplotlib.pyplot as plt  
from lime import lime_tabular
from sklearn.preprocessing import LabelEncoder
from imblearn.over_sampling import SMOTE



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

def RCA_bio(path, batch, target, ip, index, num_ft):
    data_source = 'dataFiles/BioreactorData.csv'
    df = pd.read_csv(data_source)
    df.rename(columns=bio_cols, inplace=True)
    df.drop(['Time', 'Batch Ref'], axis=1, inplace=True)

    # Training ML model on first 10k records
    df_train = df[:10000]
    ip = [bio_cols[col] if col in bio_cols.keys() else col for col in ip]

    if target in bio_cols.keys():
        target = bio_cols[target]

    val = df.loc[index][target]
    
    # Dropping out record with target value from training
    if index in list(df_train.index):
        df_train.drop(index, inplace=True)

    






    # Taking only user selected variables as model training
    X_train = df_train[ip]
    y_train = df_train[target]
    
    # Taking out record with target value for prediction
    X_pred = df[ip].iloc[index]


    lgb = LGBMRegressor()
    mdl = lgb.fit(X_train, y_train)
    dump(mdl, 'trained_model.pkl')


    explainer_lime = lime_tabular.LimeTabularExplainer(
        X_train.values,
        feature_names=X_train.columns.values.tolist(),
        class_names=[target],
        verbose=False,
        mode='regression'
    )

    exp = explainer_lime.explain_instance(X_pred.values, lgb.predict, num_features=num_ft)

    # Get min, max values for each feature
    min_max_values = df[ip].agg(['min', 'max']).transpose()
    #min_max_X_pred = {feature: {"min": df[feature].min(), "max": df[feature].max()} for feature in X_pred.index}

#Logic to create the X_pred_list dataframe in the desired format
    # X_pred_list = {}
    # for feature in X_pred.index:
    #     X_pred_list[feature] = {
    #         'Feature': feature,
    #         'Value': X_pred[feature],
    #         'Min': min_max_values.loc[feature]['min'],
    #         'Max': min_max_values.loc[feature]['max']
    #     }




    

    # Assuming you have X_pred and min_max_values defined somewhere
    # ...

    # X_pred_list1 = []
    # for feature in X_pred.index:
    #     data = {
    #         'Feature': feature,
    #         'Value': X_pred[feature],
    #         'Min': min_max_values.loc[feature]['min'],
    #         'Max': min_max_values.loc[feature]['max']
    #     }
    #     X_pred_list1.append(data)

    # # Convert the list of dictionaries to a DataFrame
    # X_pred_list = pd.DataFrame(X_pred_list1)

# Now X_pred_df is a DataFrame with columns 'Feature', 'Value', 'Min', and 'Max'



    X_pred_list = []
    for feature in X_pred.index:
        data = {
            'Feature': feature,
            'Value': X_pred[feature],  # assuming Value is a single value
            'Min': min_max_values.loc[feature]['min'],
            'Max': min_max_values.loc[feature]['max']
        }
        X_pred_list.append(data)

    # Now, X_pred_list is in the desired format
    response = {"X_pred_list": X_pred_list}

    # Print the response
    print(response)





    var = [[col, 
            X_pred[col], 
            np.round(item[1], 2), 
            min_max_values.loc[col]['min'], 
            min_max_values.loc[col]['max']] 
           for col in list(df.columns) for item in exp.as_list() if item[0].find(col) != -1]
    
    feat = pd.DataFrame(var, columns=['Feature', 'Value', 'Impact', 'Min', 'Max'])
    
    return exp, mdl, X_pred, val, feat, var,X_pred_list


def RCA_synres_cls(path, target, ip, index, num_ft):
    df = pd.read_csv(path)
    df.rename(columns=synres_cols, inplace=True)
    df.drop('Time', axis=1, inplace=True)

    df['FIT18910'] = df['FIT18910'].apply(lambda x: x.replace(',', ''))
    df['FIT18910'] = df['FIT18910'].astype(float)
    df['XXA18902'] = df['XXA18902'].replace('Normal', 1)
    df['XXA18902'] = df['XXA18902'].replace('Disagree', 0)
    val = df.loc[index][target]
    
    oversample = SMOTE()
    le = LabelEncoder()

    for i in ['XXA18902', 'KPV18918', 'KPV18942', 'M73701', 'KPV84318']:
        df[i] = le.fit_transform(df[i])

    ip = [synres_cols[col] if col in synres_cols.keys() else col for col in ip]

    if target in synres_cols.keys():
        target = synres_cols[target]

    # Dropping out record with target value from training
    df.drop(index, inplace=True)

    # Taking only user selected variables as model training
    X = df[ip]
    y = df[target]

    # Taking out record with target value for prediction
    X_pred = X.iloc[index]





    






    # Oversampling to balance minority class
    X, y = oversample.fit_resample(X, y)
    logreg = LogisticRegression()

    mdl = logreg.fit(X, y)
    dump(mdl, 'trained_model.pkl')

    #print('----------------', mdl)

    explainer_lime = lime_tabular.LimeTabularExplainer(
        X.values,
        feature_names=X.columns.values.tolist(),
        class_names=['Disagreed', 'Normhhbal'],
        verbose=False,
        mode='classification'
    )
    

    exp = explainer_lime.explain_instance(X_pred.values, logreg.predict_proba, num_features=num_ft)

    # Get min, max values for each feature
    min_max_values = df[ip].agg(['min', 'max']).transpose()

    var = [[col,
            X_pred[col], 
            np.round(item[1], 2), 
            min_max_values.loc[col]['min'], 
            min_max_values.loc[col]['max']] 
           for col in list(df.columns) for item in exp.as_list() if item[0].find(col) != -1]
    

    X_pred_list = []
    for feature in X_pred.index:
        data = {
            'Feature': feature,
            'Value': X_pred[feature],  # assuming Value is a single value
            'Min': min_max_values.loc[feature]['min'],
            'Max': min_max_values.loc[feature]['max']
        }
        X_pred_list.append(data)

    # Now, X_pred_list is in the desired format
    response = {"X_pred_list": X_pred_list}

    # Print the response
    print(response)



    feat = pd.DataFrame(var, columns=['Feature', 'Value', 'Impact', 'Min', 'Max'])
   # print(exp,'-------done----------')
    
    return exp, mdl, X_pred, val, feat, var,X_pred_list

from joblib import dump
def RCA_synres_reg(path, target, ip, index, num_ft):
    df = pd.read_csv(path)
    df.rename(columns=synres_cols, inplace=True)

    df.drop('Time', axis=1, inplace=True)
    
    df['FIT18910'] = df['FIT18910'].apply(lambda x: x.replace(',', ''))
    df['FIT18910'] = df['FIT18910'].astype(float)

    le = LabelEncoder()

    for i in ['XXA18902', 'KPV18918', 'KPV18942', 'M73701', 'KPV84318']:
        df[i] = le.fit_transform(df[i])

    ip = [synres_cols[col] if col in synres_cols.keys() else col for col in ip]

    if target in synres_cols.keys():
        target = synres_cols[target]

    val = df.loc[index][target]

    # Dropping out record with target value from training
    if index in list(df.index):
        df.drop(index, inplace=True)

    # Taking only user selected variables as model training
    X = df[ip]
    y = df[target]

    # Taking out record with target value for prediction
    X_pred = X.iloc[index]


    lgb = LGBMRegressor()

    mdl = lgb.fit(X, y)
    dump(mdl, 'trained_model.pkl')

    #print('----------------', mdl)

    explainer_lime = lime_tabular.LimeTabularExplainer(
        X.values,
        feature_names=X.columns.values.tolist(),
        class_names=[target],
        verbose=False,
        mode='regression'
    )

    exp = explainer_lime.explain_instance(X_pred.values, lgb.predict, num_features=num_ft)

    # Get min, max values for each feature
    min_max_values = df[ip].agg(['min', 'max']).transpose()

    X_pred_list = []
    for feature in X_pred.index:
        data = {
            'Feature': feature,
            'Value': X_pred[feature],  # assuming Value is a single value
            'Min': min_max_values.loc[feature]['min'],
            'Max': min_max_values.loc[feature]['max']
        }
        X_pred_list.append(data)

    # Now, X_pred_list is in the desired format
    response = {"X_pred_list": X_pred_list}

    # Print the response
    print(response)

    var = [[col, 
            X_pred[col], 
            np.round(item[1], 2), 
            min_max_values.loc[col]['min'], 
            min_max_values.loc[col]['max']] 
           for col in list(df.columns) for item in exp.as_list() if item[0].find(col) != -1]

    feat = pd.DataFrame(var, columns=['Feature', 'Value', 'Impact', 'Min', 'Max'])
    
    return exp, mdl, X_pred, val, feat, var,X_pred_list












def XAI(project,typ,batch,target,ip,index,num_ft):
    '''
    XAI Final function

    Parameters
    ----------
    project : string
        Project Type - bioreactor/synres.
    typ : string
        Problem Type - classification/regression.
    batch : int
        Batch Number.
    target : string
        Target Variable Name.
    ip : List
        List of all selected input variables.
    index : int
        Index of the record to be analyzed.
    num_ft : int
        Number of features required in final analysis.

    Returns
    -------
    exp : Explainer instance
        Explainer instance - To be used for plots.
    mdl : ML Model
        Trained ML model - To be used for what if predictions.
    X_pred : Pandas Series
        Variable list of selected record - To be used for plots and predictions.
    val : int
        Actual Value of selected record.
    feat : Pandas DataFrame
        Feature value and impacts dataframe - To be used for plots and predictions.
    '''
    
    if (project=='bioreactor') & (typ=='regression'):
        path='dataFiles/BioreactorData.csv'
        exp,mdl,X_pred,val,feat,var,X_pred_list=RCA_bio(path,batch,target,ip,index,num_ft)
    elif (project=='synres') & (typ=='classification'):
        path='dataFiles/synres_dataset.csv'
        exp,mdl,X_pred,val,feat,var,X_pred_list=RCA_synres_cls(path,target,ip,index,num_ft)
    elif (project=='synres') & (typ=='regression'):
        path='dataFiles/synres_dataset.csv'
        exp,mdl,X_pred,val,feat,var,X_pred_list=RCA_synres_reg(path,target,ip,index,num_ft)
    return exp,mdl,X_pred,val,feat,var,X_pred_list


