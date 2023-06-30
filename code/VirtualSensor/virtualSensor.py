import paho.mqtt.client as mqtt
import json
import random
import time

# MQTT broker configuration
broker_address = 'localhost'
broker_port = 1883
topic = 'sensor_data_topic'

# broker_address = '0.tcp.in.ngrok.io'
# broker_port = 10136
# topic = 'sensor_data_topic'

# Create MQTT client
client = mqtt.Client()

# Connect to the broker
client.connect(broker_address, broker_port)

# Generate and publish dummy sensor data
while True:
    # Generate random sensor data
    sensor_data = {
        'temperature': random.uniform(25, 30),
        'humidity': random.uniform(40, 60),
        'pressure': random.uniform(900, 1100)
    }

    ir =  random.uniform(25, 30)
    HR = random.uniform(40, 60)
    temperature  = random.uniform(25, 30)
    SPO2 = random.uniform(25, 30)

    # ir =  10
    # HR = 20
    # temperature  = 30
    # SPO2 = 40


    # Convert sensor data to JSON
    payload = json.dumps(sensor_data)

    # Publish sensor data to the topic
    
    client.publish("UoP_CO_326_E18_10_MAX30102_IR", ir)
    client.publish("UoP_CO_326_E18_10_MAX30102_HR", HR)
    client.publish("UoP_CO_326_E18_10_MAX30102_SPO2", SPO2)
    client.publish("UoP_CO_326_E18_10_DS18B20_temperature", temperature)
    



    if(sensor_data['temperature'] > 28):
        client.publish("led", "on")
    else:
        client.publish("led", "off")

    # Print the published data
    print(f"Published: {payload}")

    # Wait for a few seconds before publishing the next data
    time.sleep(5)

# Disconnect from the broker
client.disconnect()


drop table if EXISTS UoP_CO_326_E18_10_MAX30102_HR;  CREATE TABLE UoP_CO_326_E18_10_MAX30102_HR(id INT AUTO_INCREMENT PRIMARY KEY,patient_id char(8)  ,time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,heartRate char(8)  NULL);
drop table if EXISTS UoP_CO_326_E18_10_MAX30102_SPO2;  CREATE TABLE UoP_CO_326_E18_10_MAX30102_SPO2(id INT AUTO_INCREMENT PRIMARY KEY,patient_id char(8)  ,time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, spo2 char(8)  NULL);
drop table if EXITS UoP_CO_326_E18_10_DS18B20_temperature;  CREATE TABLE UoP_CO_326_E18_10_DS18B20_temperature(id INT AUTO_INCREMENT PRIMARY KEY,patient_id char(8)  ,time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,temperature char(8)  NULL);