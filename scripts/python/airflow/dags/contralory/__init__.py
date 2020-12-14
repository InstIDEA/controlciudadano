def if_all_done(ti, **kwargs):
    if(ti.xcom_pull(key='some_failure', task_ids='get_directory_listing_from_contralory_page')):
        raise(Exception('Not all operators succeeded'))
    elif(ti.xcom_pull(key='some_failure', task_ids='download_new_PDFs_from_list')):
        raise(Exception('Not all operators succeeded'))
    elif(ti.xcom_pull(key='some_failure', task_ids='extract_data_from_names')):
        raise(Exception('Not all operators succeeded'))
    elif(ti.xcom_pull(key='some_failure', task_ids='push_to_db')):
        raise(Exception('Not all operators succeeded'))
    else:
        print('All done.')