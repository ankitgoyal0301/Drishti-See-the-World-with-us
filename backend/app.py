from flask import Flask, render_template, request, redirect
from werkzeug.utils import secure_filename
from werkzeug.datastructures import FileStorage
import cv2
import os
import shutil
import numpy as np

import tensorflow as tf
import segmentation_models as sm
import efficientnet.keras as efn

from tensorflow.keras.preprocessing.image import ImageDataGenerator
from keras.models import Sequential
from keras.layers import Dropout, Dense, GlobalAveragePooling2D
from tensorflow.keras.optimizers import Adam

import keras.backend.tensorflow_backend as tb
# tb._SYMBOLIC_SCOPE.value = True

from collections import Counter
import smtplib
from email.mime.text import MIMEText


# Python Program to Get IP Address
import socket
def get_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        # doesn't even have to be reachable
        s.connect(('10.255.255.255', 1))
        IP = s.getsockname()[0]
    except:
        IP = '127.0.0.1'
    finally:
        s.close()
    return IP    
IPAddr = get_ip()
print("Your Computer IP Address is:" + IPAddr)  


######################################################
#TEXT REC
from final.OCR import ocr_doc, ocr_non_doc


app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = "./uploads"

height = 224
width = 224
channels = 3
n_classes = 8
input_shape = (height, width, channels)

efnb0 = efn.EfficientNetB0(weights='imagenet', include_top=False, input_shape=input_shape, classes=n_classes)
model = Sequential()
model.add(efnb0)
model.add(GlobalAveragePooling2D())
model.add(Dropout(0.5))
model.add(Dense(n_classes, activation='softmax'))
optimizer = Adam(lr=0.0001)
model.compile(optimizer=optimizer, loss='categorical_crossentropy', metrics=['acc'])
model.load_weights("model_5.h5")

##################################
latitude = None
longitude = None


@app.route('/currency', methods=['GET', 'POST'])
def file_upload():
   if request.method == 'POST':
      
      files = os.listdir('./frames/frames')
      if len(files) != 0:  
        
        for x in files:
          os.remove('./frames/frames/' + x)

      f = request.files['videoFile']
      print(f)
      f.save(secure_filename(f.filename))
      vidObj = cv2.VideoCapture(str(f.filename))
      length = int(vidObj.get(cv2.CAP_PROP_FRAME_COUNT))
      # print(length)
      div = length//30
      success = 1
      count = 0
      
      while success:
          
          success, image = vidObj.read()
          # print(count,success)
          if success == 0 or success == None:
            break;

          dir_path = os.path.dirname(os.path.realpath(__file__))
          if count%div==0:
            cv2.imwrite("./frames/frames/frame%d.jpg" % count, image)
          count+=1 

      print("Frames done!!!")

      sm.set_framework('tf.keras')
      sm.framework()
      height = 224
      width = 224
      channels = 3
      n_classes = 8
      input_shape = (height, width, channels)

      print("About to read model")
      
      # efnb0 = efn.EfficientNetB0(weights='imagenet', include_top=False, input_shape=input_shape, classes=n_classes)
      # model = Sequential()
      # model.add(efnb0)
      # model.add(GlobalAveragePooling2D())
      # model.add(Dropout(0.5))
      # model.add(Dense(n_classes, activation='softmax'))
      # optimizer = Adam(lr=0.0001)
      # model.compile(optimizer=optimizer, loss='categorical_crossentropy', metrics=['acc'])
      # model.load_weights("model_5.h5")
      
      label_map = {0: '10',
             1: '100',
             2: '20',
             3: '200',
             4: '2000',
             5: '50',
             6: '500',
             7: 'Background'}
      test_datagen = ImageDataGenerator(rescale=1./255)
      test_generator = test_datagen.flow_from_directory(
        "./frames",
        target_size=(224, 224),
        color_mode="rgb",
        shuffle = False,
        class_mode='categorical',
        #batch_size=8
        )
      
      filenames = test_generator.filenames
      tb._SYMBOLIC_SCOPE.value = True
      predict = model.predict(test_generator, verbose=1)
      predList = []
      for index, x in enumerate(filenames):
        pred = label_map[np.argmax(predict[index])]
        predList.append(pred)
      c = Counter(predList)
      c.most_common(1)
      note = c.most_common(1)[0][0]
      print(note)

      if note == 'Background':
        return {"prediction": "No Currency Note detected. Please place the currency note correctly below the camera and try again."}

      return {"prediction":"The predicted currency note is " + note + " rupees"}
   else: 
    return render_template('upload.html')
		
@app.route('/text-doc', methods=['GET', 'POST'])
def text_recognition():
  
  if request.method == 'POST':
    files = os.listdir('.\\final\\images')
    
    if len(files) != 0:      
      for x in files:
        os.remove('.\\final\\images\\' + x)

    f = request.files['file']
    print("Before")

    f.save('.\\final\\images\\' + secure_filename(f.filename))
    print("After")
    
    try:
      result,success = ocr_doc(".\\final\\images")
    except:
      return {"Prediction": "Error", "success":"False"}

    print("Result:'" + result + "'")

    return {"Prediction": result, "success":"True"}
  
  else:
   return render_template('upload.html')

@app.route('/text-non-doc', methods=['GET', 'POST'])
def text_recognition_non_doc():
  
  if request.method == 'POST':
    files = os.listdir('.\\final\\images')
    
    if len(files) != 0:      
      for x in files:
        os.remove('.\\final\\images\\' + x)

    f = request.files['file']
    print("Before")

    f.save('.\\final\\images\\' + secure_filename(f.filename))
    print("After")
    result = ocr_non_doc(".\\final\\images")
    print(result)

    return {"Prediction": result}
  
  else:
   return render_template('upload.html')

@app.route('/update-location', methods=['POST'])
def update_location():

    global longitude, latitude
  
    f = request.json
    latitude = f['lat']
    longitude = f['long']

    return {"success": True}

@app.route('/send-location', methods=['POST'])
def send_location():
  
    f = request.json
    emailList = f['emailList']
    print(emailList)
    ip = 'http://' + IPAddr + ':5000/get-location'

    gmail_user = 'drishti.cse22@gmail.com'
    gmail_password = 'drishtimajor2022'

    sent_from = gmail_user
    to = [person['email'] for person in emailList]
    subject = 'Drishti - Location Support'
    body = '''
Hey,

Hope you’re doing great! I have a location update of your friend. 

Please use the given link to get his/her live location: %s

If you have any more questions or come across any issue, let us know, We’ll be happy to help.

Have a great day,

Team Drishti
    ''' % (ip)

    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = gmail_user
    msg['To'] = ", ".join(to)

    email_text = """
    From: %s
    To: %s
    Subject: %s

    %s
    """ % (sent_from, ", ".join(to), subject, body.encode('utf-8'))

    try:
        smtp_server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
        smtp_server.ehlo()
        smtp_server.login(gmail_user, gmail_password)
        smtp_server.sendmail(sent_from, to, msg.as_string())
        smtp_server.close()
        print ("Email sent successfully!")
    except Exception as ex:
        print ("Something went wrong….",ex)

    return {"success": True}
  
@app.route('/get-location', methods=['GET','POST'])
def get_location():

    location = 'https://maps.google.com/?ll=' + str(latitude) + ',' + str(longitude)

    location_marker = 'https://www.google.com/maps/search/?api=1&query=' + str(latitude) + ',' + str(longitude)

    return redirect(location_marker, code=302)



if __name__ == '__main__':
   app.run(debug = True,threaded=False)