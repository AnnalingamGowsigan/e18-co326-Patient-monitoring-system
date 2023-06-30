#include "Secrets.h"
#include <WiFi.h>
#include <AsyncTCP.h>
#include <ESPAsyncWebServer.h>
#include <AsyncElegantOTA.h>
#include <PubSubClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>

/////////////////////////////////////////
#include "MAX30105.h"
#include "spo2_algorithm.h"

// Declare a flag variable
bool flag = true;

MAX30105 particleSensor;

#define MAX_BRIGHTNESS 255

#if defined(__AVR_ATmega328P__) || defined(__AVR_ATmega168__)
// Arduino Uno doesn't have enough SRAM to store 100 samples of IR led data and red led data in 32-bit format
// To solve this problem, 16-bit MSB of the sampled data will be truncated. Samples become 16-bit data.
uint16_t irBuffer[100];  // infrared LED sensor data
uint16_t redBuffer[100]; // red LED sensor data
#else
uint32_t irBuffer[100];  // infrared LED sensor data
uint32_t redBuffer[100]; // red LED sensor data
#endif

int32_t bufferLength;  // data length
int32_t spo2;          // SPO2 value
int8_t validSPO2;      // indicator to show if the SPO2 calculation is valid
int32_t heartRate;     // heart rate value
int8_t validHeartRate; // indicator to show if the heart rate calculation is valid

byte pulseLED = 11; // Must be on PWM pin
byte readLED = 13;  // Blinks with each data read
/////////////////////////////////////////

// Temperature sensor
const int Temperature_sensor_pin = 14;          // GPIO where the DS18B20 is connected to
OneWire oneWire(Temperature_sensor_pin);        // Setup a oneWire instance to communicate with any OneWire devices
DallasTemperature Temperature_sensor(&oneWire); // Pass our oneWire reference to Dallas Temperature sensor

float temperatureC;
float temperatureF;

// Initializes the espClient. You should change the espClient name if you have multiple ESPs running in your home automation system
WiFiClient espClient;
PubSubClient client(espClient);

// This functions reconnects your ESP8266 to your MQTT broker
// Change the function below if you want to subscribe to more topics with your ESP8266
void reconnect()
{
  // Loop until we're reconnected
  while (!client.connected())
  {
    Serial.print("Attempting MQTT connection...");

    if (client.connect("ESP8266Client22"))
    {
      Serial.println("connected");
      // Subscribe or resubscribe to a topic
      // You can subscribe to more topics (to control more LEDs in this example)
      client.subscribe("led_control");
    }
    else
    {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

// Lamp - LED - GPIO 4
const int ledPin = 4;

// This functions is executed when some device publishes a message to a topic that your NodeMCU is subscribed to
void callback(String topic, byte *message, unsigned int length)
{
  Serial.print("Message arrived on topic: ");
  Serial.print(topic);
  Serial.print(". Message: ");
  String messageInfo;

  for (int i = 0; i < length; i++)
  {
    Serial.print((char)message[i]);
    messageInfo += (char)message[i];
  }
  Serial.println();

  // If a message is received on the topic room/lamp, you check if the message is either on or off. Turns the lamp GPIO according to the message
  if (topic == "led_control")
  {
    Serial.print("Changing Room Light to ");
    if (messageInfo == "reset")
    {
      // digitalWrite(ledPin, HIGH);
      Serial.print("reset");

      // Reset the flag
      flag = true;
    }

    else if (messageInfo == "off")
    {
      digitalWrite(ledPin, LOW);
      Serial.print("Off");

      flag = false;
    }
  }
  Serial.println();
}

// Initialize WiFi
void initWiFi()
{
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi ..");

  // Wait for connection
  while (WiFi.status() != WL_CONNECTED)
  {
    Serial.print('.');
    delay(1000);
  }
  Serial.println(WiFi.localIP());
}

int getReadingFromTempertureSensor()
{
  // for calculating Temperature value
  Temperature_sensor.requestTemperatures();
  temperatureC = Temperature_sensor.getTempCByIndex(0);
  temperatureF = Temperature_sensor.toFahrenheit(temperatureC);
  Serial.print("Temperature Value = ");
  Serial.print(temperatureC);
  Serial.print("ºC | ");
  Serial.print(temperatureF);
  Serial.println("F");
  Serial.println();

  String temperatureCStr = String(temperatureC);
  client.publish("UoP_CO_326_E18_10_DS18B20_temperature", temperatureCStr.c_str());

  return temperatureC;

  // delay(5000);
}

void measureHeartRateAndSpO2()
{
  bufferLength = 100; // buffer length of 100 stores 4 seconds of samples running at 25sps

  // read the first 100 samples, and determine the signal range
  for (byte i = 0; i < bufferLength; i++)
  {
    while (particleSensor.available() == false) // do we have new data?
      particleSensor.check();                   // Check the sensor for new data

    redBuffer[i] = particleSensor.getRed();
    irBuffer[i] = particleSensor.getIR();
    particleSensor.nextSample(); // We're finished with this sample so move to next sample

    Serial.print(F("red="));
    Serial.print(redBuffer[i], DEC);
    Serial.print(F(", ir="));
    Serial.println(irBuffer[i], DEC);
  }

  // calculate heart rate and SpO2 after first 100 samples (first 4 seconds of samples)
  maxim_heart_rate_and_oxygen_saturation(irBuffer, bufferLength, redBuffer, &spo2, &validSPO2, &heartRate, &validHeartRate);

  // Continuously taking samples from MAX30102.  Heart rate and SpO2 are calculated every 1 second
  // while (1)
  //{
  // dumping the first 25 sets of samples in the memory and shift the last 75 sets of samples to the top
  for (byte i = 25; i < 100; i++)
  {
    redBuffer[i - 25] = redBuffer[i];
    irBuffer[i - 25] = irBuffer[i];
  }

  // take 25 sets of samples before calculating the heart rate.
  for (byte i = 75; i < 100; i++)
  {
    while (particleSensor.available() == false) // do we have new data?
      particleSensor.check();                   // Check the sensor for new data

    digitalWrite(readLED, !digitalRead(readLED)); // Blink onboard LED with every data read

    redBuffer[i] = particleSensor.getRed();
    irBuffer[i] = particleSensor.getIR();
    particleSensor.nextSample(); // We're finished with this sample so move to next sample

    // send samples and calculation result to terminal program through UART
    Serial.print(F("red="));
    Serial.print(redBuffer[i], DEC);
    // client.publish("test1", "asd1");

    Serial.print(F(", ir="));
    Serial.print(irBuffer[i], DEC);
    String irValue = String(irBuffer[i]);
    client.publish("UoP_CO_326_E18_10_MAX30102_IR", irValue.c_str());

    Serial.print(F(", HR="));
    Serial.print(heartRate, DEC);
    String heartRateStr = String(heartRate);
    client.publish("UoP_CO_326_E18_10_MAX30102_HR", heartRateStr.c_str());

    Serial.print(F(", HRvalid="));
    Serial.print(validHeartRate, DEC);
    // client.publish("test1", "asd1");

    Serial.print(F(", SPO2="));
    Serial.print(spo2, DEC);
    String spo2Str = String(spo2);
    client.publish("UoP_CO_326_E18_10_MAX30102_SPO2", spo2Str.c_str());

    Serial.print(F(", SPO2Valid="));
    Serial.println(validSPO2, DEC);
    // client.publish("test1", "asd1");
  }

  // After gathering 25 new samples recalculate HR and SP02
  maxim_heart_rate_and_oxygen_saturation(irBuffer, bufferLength, redBuffer, &spo2, &validSPO2, &heartRate, &validHeartRate);
  //}
}

void maintainConnectionWithMQTT()
{
  if (!client.connected())
  {
    reconnect();
  }

  if (!client.loop())
  {
    client.connect("ESP8266Client22");
  }

  // MQTT connection and other loop code
  client.loop();
}

// the setup function runs once when you press reset or power the board
void setup()
{

  // Serial port for debugging purposes
  Serial.begin(115200);

  //////////////////////////////////////////
  pinMode(pulseLED, OUTPUT);
  pinMode(readLED, OUTPUT);

  // Initialize sensor
  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) // Use default I2C port, 400kHz speed
  {
    Serial.println(F("MAX30105 was not found. Please check wiring/power."));
    while (1)
      ;
  }

  Serial.println(F("Attach sensor to finger with rubber band. Press any key to start conversion"));
  while (Serial.available() == 0)
    ; // wait until user presses a key
  Serial.read();

  byte ledBrightness = 60; // Options: 0=Off to 255=50mA
  byte sampleAverage = 4;  // Options: 1, 2, 4, 8, 16, 32
  byte ledMode = 2;        // Options: 1 = Red only, 2 = Red + IR, 3 = Red + IR + Green
  byte sampleRate = 100;   // Options: 50, 100, 200, 400, 800, 1000, 1600, 3200
  int pulseWidth = 411;    // Options: 69, 118, 215, 411
  int adcRange = 4096;     // Options: 2048, 4096, 8192, 16384

  particleSensor.setup(ledBrightness, sampleAverage, ledMode, sampleRate, pulseWidth, adcRange); // Configure sensor with these settings
  //////////////////////////////////////////

  // ledclight
  pinMode(ledPin, OUTPUT);

  Temperature_sensor.begin(); // Start the Temperature sensor

  initWiFi();
  // Sets your mqtt broker and sets the callback function
  // The callback function is what receives messages and actually controls the LEDs
  client.setServer(mqtt_server, mqtt_server_port_number);
  client.setCallback(callback);
}

void loop()
{

  maintainConnectionWithMQTT();

  measureHeartRateAndSpO2();

  int temp = getReadingFromTempertureSensor();

  // Check the flag state
  if (flag)
  {
    if (temp > 28)
    {
      digitalWrite(4, HIGH); // turn the LED on (HIGH is the voltage level)

      // Perform actions when the flag is true
      client.publish("led", "on");
    }
  }

  // delay(1000);                       // wait for a second
  // digitalWrite(4, LOW);    // turn the LED off by making the voltage LOW
  // delay(1000);                       // wait for a second
}