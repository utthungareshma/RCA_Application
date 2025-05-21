## RCA Setup 

### Prerequisite
1. Install docker and docker-compose 


### Dev Setup

1. Start the database  
    ```
    docker-compose -f docker-compose-pg.yml up -d  
    ```
    >  Please make sure local volume is available

2. Create Database
    ``` 
    docker exec -it rca-pg sh
    psql -U postgres
    CREATE DATABASE rca;
    CREATE USER dbuser WITH PASSWORD 'dbpassword';
    GRANT ALL PRIVILEGES ON DATABASE "rca" to dbuser;
    ```

3. Create python venv  

    ```
    python3 -m venv ~/envs/rca
    source ~/envs/rca/bin/activate
    pip3 install -r requirements.txt

    ```
4. Run the django application  
    ```
    cd rca
    python manage.py makemigrations
    ```
    for the fist time run:
    ```
    python manage.py migrate

    python manage.py runserver 0:8000
    ```


5. Create Test User  
    ```
    cd rca
    source ~/envs/rca/bin/activate
    ```

    ```
    python manage.py createsuperuser  [enter username, email details]
    ```

6. Run the application 
    ```
    python manage.py runserver 0:8000
    ```

    












