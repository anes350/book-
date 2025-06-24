import requests

api_key = "ضع_مفتاح_API_هنا"
text = "الذكاء الاصطناعي هو تقنية حديثة تستخدم في عدة مجالات."

response = requests.post(
    "https://api.deepai.org/api/text-generator",
    data={'text': text},
    headers={'api-key': api_key}
)

print(response.json()['output'])
