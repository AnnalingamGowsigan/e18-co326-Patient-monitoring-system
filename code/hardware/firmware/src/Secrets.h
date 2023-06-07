#include <pgmspace.h>

#define SECRET

const char WIFI_SSID[] = "Galaxy A51 53CE";                                            // change this
const char WIFI_PASSWORD[] = "00000003";                                               // change this
const char AWS_IOT_ENDPOINT[] = "a1sebe49a1oqq2-ats.iot.ap-northeast-1.amazonaws.com"; // change this

// Amazon Root CA 1
static const char AWS_CERT_CA[] PROGMEM = R"EOF(
-----BEGIN CERTIFICATE-----

-----END CERTIFICATE-----
)EOF";

// Device Certificate                                               //change this
static const char AWS_CERT_CRT[] PROGMEM = R"KEY(
-----BEGIN CERTIFICATE-----

-----END CERTIFICATE-----


 
 
)KEY";

// Device Private Key                                               //change this
static const char AWS_CERT_PRIVATE[] PROGMEM = R"KEY(
-----BEGIN RSA PRIVATE KEY-----

-----END RSA PRIVATE KEY-----

 
 
)KEY";