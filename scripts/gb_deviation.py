import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
import matplotlib.pyplot as plt

# The following function will go to rca_sel_batch_compare_with_gb.py
def sel_batch_compare_with_gb(data_source, batch_id, cqa, cqa_threshold, cpp_list, batch_column, time_column):
    #Import packages and libraries
    import pandas as pd
    import numpy as np
    from sklearn.preprocessing import StandardScaler
    import matplotlib.pyplot as plt
    
    #####################################
    ## 1. Read data
    #####################################
    # df = spark.read.csv(data_source).toPandas()
    # use the following for utthunga team and commented out the aobve read 
    #data_source = 'D:\\data_new\\BioreactorData.csv'
    # data_source = r'D:/data_new/BioreactorData.csv'
    # The following function will go to rca_sel_batch_compare_with_gb.py
def sel_batch_compare_with_gb(data_source, batch_id, cqa, cqa_threshold, cpp_list, batch_column, time_column):
    #Import packages and libraries
    import pandas as pd
    import numpy as np
    from sklearn.preprocessing import StandardScaler
    import matplotlib.pyplot as plt
    #data_source = r'D:/data_new/BioreactorData.csv'
    
    #####################################
    ## 1. Read data
    #####################################
    # df = spark.read.csv(data_source).toPandas()
    # use the following for utthunga team and commented out the aobve read 
    df = pd.read_csv(data_source)
    
    df.head()
    condition = df[batch_column] == batch_id
    filtered_df = df[condition]
    index_numbers = (filtered_df.index + 2).tolist()
    #df.columns = df.iloc[0] 
    #df = df[1:]

    feature_list = [time_column] + cpp_list + [cqa, batch_column]
   
    target_list = [time_column, cqa, batch_column]

    cpp_cqa_list = cpp_list.copy()
    cpp_cqa_list.append(cqa)

    #####################################
    ## 2. Filter data by UI input parameters
    #####################################
    # CPPs
    fulldf = df[feature_list]
    #cols1 = fulldf.columns[fulldf.dtypes.eq('object')]
    # Need to comment out for UI team
    # fulldf[cols1] = fulldf[cols1].apply(pd.to_numeric, errors='coerce')

    # Dennis 10/16/2023 Add two new return paramters: time_step, time_step_unit per business 
    time_step = fulldf[time_column].iloc[2] - fulldf[time_column].iloc[1]
    time_step = round(time_step, 2)
    #cols1 = fulldf.columns[fulldf.dtypes.eq('object')]
    # Need to comment out for UI team
    # fulldf[cols1] = fulldf[cols1].apply(pd.to_numeric, errors='coerce')

    # CQA
    Ydf = df[target_list]
    #cols1 = Ydf.columns[Ydf.dtypes.eq('object')]\
    # Need to comment out for UI team
    # Ydf[cols1] = Ydf[cols1].apply(pd.to_numeric, errors='coerce')

    ####################################################################
    ## 3. Batchwise preprocessing for process variables (predictors)
    ####################################################################
    GroupsX = fulldf.groupby(batch_column)    
    GroupsY = Ydf.groupby(batch_column)        

    # Batchwise unfolding cpps
    batchsize = []  
    for name, group in GroupsX:
        group = group.drop(columns=[batch_column, time_column])
        group_array = group.values
        group_array = group_array.reshape(1,group_array.shape[0]*group_array.shape[1])
        batchsize.append(group_array.shape[0]*group_array.shape[1])
        exec(f"Batch{name} = group_array")
      
    # Batchwise unfolding cqa
    for name, group in GroupsY:
        group = group.drop(columns=[batch_column, time_column])
        group_array = group.values
        group_array = group_array.reshape(1,group_array.shape[0]*group_array.shape[1])
        exec(f"YBatch{name} = group_array")

    # Pencillin concentration at end of each batch run
    num_of_batch = fulldf[batch_column].max()
    finalcon = []
    start = 1
    end  = num_of_batch
    for i in range(start,end+1):
            con = vars()["YBatch"+str(i)][0][-1]
            finalcon.append(con)

    ####################################################
    # 4. Use UI cqa threshold for identifying NOC (good) batch
    # 4.1 Seperate Good batches (Norminal Operating Condition (NOC)) from low yielding batches
    # 4.2 Find maximum number of NOC batches with same batch run time
    ####################################################
    NOCminThreshold = int(cqa_threshold)
    print(NOCminThreshold)

    #Find indices for NOC batches
    nocind = [index for index, item in enumerate(finalcon) if item >= NOCminThreshold]  
    NOC = [x+1 for x in nocind]

    #Find indices for Low yield batches
    bbind = [index for index, item in enumerate(finalcon) if item < NOCminThreshold]
    BB  = [x+1 for x in bbind]

    # Gert size of batches (NOC and bad batches)
    NOCbatchsize = [batchsize[i] for i in nocind]
    BBbatchsize = [batchsize[i] for i in bbind]

    NOCuniq, NOCcounts = np.unique(NOCbatchsize, return_counts=True) #Get unique batch size and count of unique sizes
    NOCmax_ind = np.argmax(NOCcounts)                                #Get index of batch size with maximum count
    NOCmaxbatchshape = NOCuniq[NOCmax_ind]                           #Get size(total batch time) for maximum count batch 

    #NOC batch set
    NOCbset = []
    NOCbl = []  
    NOCind = []                                                    #Batch label
    for i in NOC:
        if (vars()["Batch"+str(i)].shape[1] == NOCmaxbatchshape):
            NOCbl.append(i)                                         #NOC batch labels
            a = vars()["Batch"+str(i)].tolist()                     #NOC batch
            NOCbset.append(a)                                         
    ar = np.array(NOCbset)
    NOCbatches = ar.reshape(NOCcounts[NOCmax_ind],NOCmaxbatchshape)
    NOC_labels = [str(x) for x in NOCbl]
    NOCbatches.shape                                               #Print the shape
    num_NOCbatches= len(NOCbatches)
    
    #Bad batch set (Low yield)
    BBbset = []
    BBbl = []                                                       #Batch label
    for i in BB:
        if (vars()["Batch"+str(i)].shape[1] == NOCmaxbatchshape):
            BBbl.append(i)
            Fa = vars()["Batch"+str(i)].tolist()
            BBbset.append(Fa)
    Far = np.array(BBbset)
    c = Far.shape[0]
    Bbatches = Far.reshape(c,NOCmaxbatchshape)
    BB_labels = [str(x) for x in BBbl]
    Bbatches.shape                                                #Print the shape

    #Combined batch set
    Combined_Batch = np.concatenate((NOCbatches, Bbatches), axis=0)
    Combined_labels = NOC_labels + BB_labels
    Combined_Batch.shape   
            
    #################################################
    ## 5. Calculate golden batch
    #################################################
    gb = np.mean(NOCbatches, axis = 0)
    std = np.std(NOCbatches, axis = 0)

    gb_ub = gb + 3 * std
    gb_lb = gb - 3 * std

    ##################################################
    ## 6. Normalize CPP batches df_combined_norm
    ##################################################
    # Define the column names
    columns = ['batch_id', 'cpp_cqa_name', 'cpp_cqa_data', 'cpp_cqa_data_norm', 'mean', 'std']

    # Create an empty DataFrame with specified columns => df_allbatch_norm
    df_combined_norm = pd.DataFrame(columns=columns)

    # Normalize the CPP batches
    num_of_features = fulldf.shape[1] - 2                   # exclude Time, batch_column
    for i in range(1, num_of_batch + 1):
        tmplist = vars()["Batch"+str(i)].tolist()[0]
        tmparray = np.array(tmplist)
        lentmplist = len(tmparray)

        for j in range(1, num_of_features + 1):
            indices = np.arange(lentmplist)
            condition = indices % num_of_features == (j-1)
            subset = tmparray[condition]
            mean = np.mean(subset)
            std = np.std(subset)
            if std != 0:
                subset_norm = (subset - mean)/std
            else:
                subset_norm = subset

            
            new_df = pd.DataFrame({'batch_id':[i], 'cpp_cqa_name':[cpp_cqa_list[j-1]], 'cpp_cqa_data':[subset],'cpp_cqa_data_norm':[subset_norm],'mean':[mean], 'std':[std]})
#             df_noc_norm = pd.concat([df_noc_norm, new_df], ignore_index = True)

#new_df = pd.DataFrame({'batch_id':[i], 'cpp_cqa_name':[cpp_cqa_list[j-1]], 'cpp_cqa_data':[subset],'cpp_cqa_data_norm':[subset_norm],'mean':[mean], 'std':[std]})
            df_combined_norm = pd.concat([df_combined_norm, new_df], ignore_index = True)
            #new_df = pd.DataFrame({'batch_id':['gb'], 'cpp_cqa_name':[cpp_cqa_list[j-1]], 'cpp_cqa_data':[gb_subset],'cpp_cqa_data_norm':[gb_subset_norm_fromatted], 'gb_upper_bound':[gb_ub_subset_fromatted], 'gb_lower_bound':[gb_lb_subset_fromatted], 'mean':[mean], 'std':[std]})
        #df_gb = pd.concat([df_gb, new_df], ignore_index = True)
            #df_combined_norm = df_combined_norm.append({'batch_id':i, 'cpp_cqa_name':cpp_cqa_list[j-1], 'cpp_cqa_data':subset,'cpp_cqa_data_norm':subset_norm,'mean':mean, 'std':std}, ignore_index = True)

    #####################################################
    ## 7. Build golden batch df_gb
    #####################################################
    # Define the column names
    columns = ['batch_id', 'cpp_cqa_name', 'cpp_cqa_data', 'cpp_cqa_data_norm', 'mean', 'std']

    # Create an empty DataFrame with specified columns
    df_gb = pd.DataFrame(columns=columns)

    for j in range(1, num_of_features + 1):
        indices = np.arange(NOCmaxbatchshape)
        condition = indices % num_of_features == (j-1)

        # golden batch
        gb_subset = gb[condition]
        mean = np.mean(gb_subset)
        std = np.std(gb_subset)
        #print("-----done------",std)
        if std != 0:
            gb_subset_norm = (gb_subset - mean)/std

            gb_subset_norm_fromatted = [format(num, '.2f') for num in gb_subset_norm]
        else:
            gb_subset_norm_fromatted = gb_subset

        # upper bound
        gb_ub_subset = gb_ub[condition]
        gb_ub_subset_fromatted = [format(num, '.2f') for num in gb_ub_subset]

        # lower bound
        gb_lb_subset = gb_lb[condition]
        gb_lb_subset_fromatted = [format(num, '.2f') for num in gb_lb_subset]

        #df_gb = df_gb.append({'batch_id':'gb', 'cpp_cqa_name':cpp_cqa_list[j-1], 'cpp_cqa_data':gb_subset,'cpp_cqa_data_norm':gb_subset_norm_fromatted, 'gb_upper_bound':gb_ub_subset_fromatted, 'gb_lower_bound':gb_lb_subset_fromatted, 'mean':mean, 'std':std}, ignore_index = True)
        # if std != 0:
        #     #gb_subset_norm = (gb_subset - mean)/std

        #     new_df = pd.DataFrame({'batch_id':['gb'], 'cpp_cqa_name':[cpp_cqa_list[j-1]], 'cpp_cqa_data':[gb_subset],'cpp_cqa_data_norm':[gb_subset_norm_fromatted], 'gb_upper_bound':[gb_ub_subset_fromatted], 'gb_lower_bound':[gb_lb_subset_fromatted], 'mean':[mean], 'std':[std]})
        # else:
        #     new_df = pd.DataFrame({'batch_id':['gb'], 'cpp_cqa_name':[cpp_cqa_list[j-1]], 'cpp_cqa_data':[gb_subset],'cpp_cqa_data_norm':[gb_subset_norm], 'gb_upper_bound':[gb_ub_subset_fromatted], 'gb_lower_bound':[gb_lb_subset_fromatted], 'mean':[mean], 'std':[std]})
        new_df = pd.DataFrame({'batch_id':['gb'], 'cpp_cqa_name':[cpp_cqa_list[j-1]], 'cpp_cqa_data':[gb_subset],'cpp_cqa_data_norm':[gb_subset_norm_fromatted], 'gb_upper_bound':[gb_ub_subset_fromatted], 'gb_lower_bound':[gb_lb_subset_fromatted], 'mean':[mean], 'std':[std]})
        df_gb = pd.concat([df_gb, new_df], ignore_index = True)
    #####################################################
    ## 8. Calculate deviation
    #####################################################
    def smape(list1, list2):
        # n = int(Combined_Batch.shape[1]/len(cpp_cqa_list))
        total_smape = 0
        len_list2 = len(list2)
        len_list1 = len(list1)

        if len_list1 <= len_list2:
            list2 = list2[:len_list1]
        else:
            list1 = list1[:len_list2]

        n = len(list1)

        for i in range(n):
            actual = float(list1[i])
            forecast = float(list2[i])
            denominator = (abs(actual) + abs(forecast))
            
            if denominator == 0:
                continue
            
            smape = (abs(forecast - actual) / denominator) * 100
            total_smape += smape
        
        return total_smape / n

    # Calculate devaition for batch 
    # Define the column names
    columns = ['batch_id', 'cpp_cqa_name', 'deviation_to_gb']

    # Create an empty DataFrame with specified columns
    df_gb_deviation = pd.DataFrame(columns=columns)
    for i in range(1, num_of_batch + 1):
        for j in range(1, num_of_features + 1):
            cpp_cqa_name = cpp_cqa_list[j-1]
            if j < num_of_features:
                list1 = df_combined_norm[(df_combined_norm['batch_id'] ==i) & (df_combined_norm['cpp_cqa_name'] ==cpp_cqa_name)]['cpp_cqa_data_norm'].tolist()
                list2 = df_gb[(df_gb['batch_id'] =='gb') & (df_gb['cpp_cqa_name'] ==cpp_cqa_name)]['cpp_cqa_data_norm'].tolist()
            else:
                list1 = df_combined_norm[(df_combined_norm['batch_id'] ==i) & (df_combined_norm['cpp_cqa_name'] ==cqa)]['cpp_cqa_data_norm'].tolist()
                list2 = df_gb[(df_gb['batch_id'] =='gb') & (df_gb['cpp_cqa_name'] ==cqa)]['cpp_cqa_data_norm'].tolist()
            result = smape(list1[0], list2[0])

            new_df = pd.DataFrame({'batch_id':[i], 'cpp_cqa_name':[cpp_cqa_list[j-1]], 'deviation_to_gb':[result]})
            df_gb_deviation = pd.concat([df_gb_deviation, new_df], ignore_index = True )
            #df_gb_deviation = df_gb_deviation.append({'batch_id':i, 'cpp_cqa_name':cpp_cqa_list[j-1], 'deviation_to_gb':result}, ignore_index = True)

    #################################################
    ## 9. Calcaute deviation from golden batch for cqa and cpp_list
    ## date: 10/02/2023 change cpp_deviation => df_cpp_deviation
    #################################################
    cqa_deviation = df_gb_deviation[(df_gb_deviation['batch_id'] == batch_id) & (df_gb_deviation['cpp_cqa_name'] == cqa)]['deviation_to_gb'].reset_index(drop=True)[0]
    df_cpp_deviation = df_gb_deviation[(df_gb_deviation['batch_id'] == batch_id) & ((df_gb_deviation['cpp_cqa_name'].isin(cpp_list)))].reset_index(drop=True)
  
    #################################################
    ## 10. Calcaute cpp drill down
    ## date: 10/02/2023 new code
    #################################################
    df_cpp_drill_down0 = df_combined_norm[(df_combined_norm['batch_id'] == batch_id) & (df_combined_norm['cpp_cqa_name'] != cqa)][['batch_id', 'cpp_cqa_name', 'cpp_cqa_data']].reset_index(drop=True)
    df_cpp_drill_down0 = df_cpp_drill_down0.rename(columns={'cpp_cqa_name':'cpp_name', 'cpp_cqa_data':'cpp_data'})
    df_cpp_gb = df_gb[(df_gb['batch_id'] == 'gb') & (df_gb['cpp_cqa_name'] != cqa)][['cpp_cqa_name', 'cpp_cqa_data', 'gb_lower_bound', 'gb_upper_bound']].reset_index(drop=True)
    df_cpp_gb = df_cpp_gb.rename(columns={'cpp_cqa_name':'cpp_name', 'cpp_cqa_data':'cpp_gb_data', 'gb_lower_bound':'cpp_gb_lower_bound', 'gb_upper_bound':'cpp_gb_upper_bound'})
    df_cpp_drill_down = pd.merge(df_cpp_drill_down0, df_cpp_gb, on='cpp_name', how='inner')

    #################################################
    ## 11. Filter data by input variables
    #################################################
    len_of_batch = int(NOCmaxbatchshape / (num_of_features))
    cqa_batch_list = []
    time_list = {}
    cqa_gb_list = []
    # need to use original data set
    cqa_batch_list = df_combined_norm[(df_combined_norm['batch_id'] == batch_id) & (df_combined_norm['cpp_cqa_name'] == cqa)]['cpp_cqa_data'].tolist()
    time_list = list(range(0, len_of_batch + 1))
    cqa_gb_list = df_gb[(df_gb['batch_id'] == 'gb') & (df_gb['cpp_cqa_name'] == cqa)]['cpp_cqa_data'].tolist()

    ## date: 10/02/2023 DL add df_cpp_drill_down                
    return index_numbers,time_list, cqa_batch_list, cqa_gb_list, cqa_deviation, df_cpp_deviation, df_cpp_drill_down, time_step
