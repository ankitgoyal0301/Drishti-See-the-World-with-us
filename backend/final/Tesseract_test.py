from PIL import Image
import pytesseract
import cv2
import numpy as np
import tempfile
import os


IMAGE_SIZE = 1800
BINARY_THREHOLD = 180

def process_image_for_ocr(file_path):
    # TODO : Implement using opencv
    temp_filename = set_image_dpi(file_path)
    im_new = remove_noise_and_smooth(temp_filename)
    return im_new

def set_image_dpi(file_path):
    im = Image.open(file_path)
    length_x, width_y = im.size
    factor = max(1, int(IMAGE_SIZE / length_x))
    size = factor * length_x, factor * width_y
    # size = (1800, 1800)
    im_resized = im.resize(size, Image.ANTIALIAS)
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.jpg')
    temp_filename = temp_file.name
    im_resized.save(temp_filename, dpi=(300, 300))
    return temp_filename

def image_smoothening(img):
    ret1, th1 = cv2.threshold(img, BINARY_THREHOLD, 255, cv2.THRESH_BINARY)
    ret2, th2 = cv2.threshold(th1, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    blur = cv2.GaussianBlur(th2, (1, 1), 0)
    ret3, th3 = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return th3

def remove_noise_and_smooth(file_name):
    img = cv2.imread(file_name, 0)
    filtered = cv2.adaptiveThreshold(img.astype(np.uint8), 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 41,
                                     3)
    kernel = np.ones((1, 1), np.uint8)
    opening = cv2.morphologyEx(filtered, cv2.MORPH_OPEN, kernel)
    closing = cv2.morphologyEx(opening, cv2.MORPH_CLOSE, kernel)
    img = image_smoothening(img)
    or_image = cv2.bitwise_or(img, closing)
    return or_image

def show_image(img):
    cv2.imshow("capture image with printed text", img)
    k = 0
    while k%256 != 32:
        k = cv2.waitKey(1)


def process_image(img, lang_code, doc,index):

    if doc:
        # img = cv2.imread(iamge_name,cv2.IMREAD_COLOR)
        # img = cv2.resize(img, (256,128))  #256,128
        # img = cv2.resize(img, None, fx=0.5, fy=0.5, interpolation=cv2.INTER_AREA)
        # img = cv2.resize(img, None, fx=1, fy=1, interpolation=cv2.INTER_LINEAR)
        # img = cv2.fastNlMeansDenoisingColored(img, None, 10, 10, 7, 15)
        
        # img = cv2.cvtColor(img, cv2.COLOR_GRAY2RGB)
        img = cv2.resize(img, None, fx=1, fy=1, interpolation=cv2.INTER_AREA)
        img = cv2.detailEnhance(img)
        
        img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        # img = cv2.bitwise_not(img)
        img = cv2.medianBlur(img, 3)
        img = cv2.threshold(img, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]

        # path = os.getcwd() +  '\\images\\cropped' + str(index) + '.png'
        # print(path)
        # cv2.imwrite(path,img)

        # kernel = np.ones((5,5), np.uint8)
        # img = cv2.erode(img, kernel, iterations=1)
        # img = cv2.dilate(img, kernel, iterations=1)

        
        
        # img, angle = deskew(img)

        #cv2.rectangle(page,(0,0),(1280,700),(255,255,255),-1)

        # cv2.imshow("capture image with printed text", img)

        # k = 0

        # while k%256 != 32:
        #     k = cv2.waitKey(1)
        # img = cv2.adaptiveThreshold(img,255,cv2.ADAPTIVE_THRESH_GAUSSIAN_C,cv2.THRESH_BINARY,11,2)
        return pytesseract.image_to_string(img, config=lang_code)
    
    else:
        # img = cv2.imread(iamge_name,cv2.IMREAD_COLOR)
        # img = cv2.resize(img, (256,128))  #256,128
        # img = cv2.resize(img, None, fx=0.5, fy=0.5, interpolation=cv2.INTER_AREA)
        # img = cv2.resize(img, None, fx=1, fy=1, interpolation=cv2.INTER_LINEAR)
        # img = cv2.fastNlMeansDenoisingColored(img, None, 10, 10, 7, 15)
        # show_image(img)
        
        img = cv2.resize(img, None, fx=5, fy=5, interpolation=cv2.INTER_AREA)
        
        show_image(img)
        img = cv2.detailEnhance(img)
        show_image(img)
        
        img = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        show_image(img)
        img = cv2.medianBlur(img, 5) # originally 3
        show_image(img)

        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (9, 3))
        img = cv2.morphologyEx(img, cv2.MORPH_TOPHAT, kernel)
        img = cv2.threshold(img, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
        # img = cv2.threshold(img,127,255,cv2.THRESH_BINARY|cv2.THRESH_OTSU)[1]
        # img = cv2.adaptiveThreshold(img,255,cv2.ADAPTIVE_THRESH_GAUSSIAN_C,\
        #     cv2.THRESH_BINARY,11,2)
        show_image(img)
        
        # img = cv2.morphologyEx(img, cv2.MORPH_OPEN, kernel)
        # show_image(img)
        # img = cv2.morphologyEx(img, cv2.MORPH_CLOSE, kernel)
        # show_image(img)
        # img = cv2.dilate(img,kernel,iterations = 1)
        
        # img = cv2.erode(img,kernel,iterations = 1)
        show_image(img)
        # img = cv2.bitwise_or(img, closing)
        # img = cv2.bitwise_not(img)
        # show_image(img)

        border_width = img.shape[0] // 20

        img = cv2.copyMakeBorder(img, border_width, border_width, border_width, border_width, cv2.BORDER_CONSTANT)
        show_image(img)

        kernel = np.ones((3,3), np.uint8)
        # img = cv2.erode(img, kernel, iterations=1)
        # img = cv2.dilate(img, kernel, iterations=1)

        
        
        # img, angle = deskew(img)

        #cv2.rectangle(page,(0,0),(1280,700),(255,255,255),-1)

        # cv2.imshow("capture image with printed text", img)

        # k = 0

        # while k%256 != 32:
        #     k = cv2.waitKey(1)
            
        # img = cv2.adaptiveThreshold(img,255,cv2.ADAPTIVE_THRESH_GAUSSIAN_C,cv2.THRESH_BINARY,11,2)
        return pytesseract.image_to_string(img, config=lang_code)
    # else:
    #     img = process_image_for_ocr(iamge_name)
    #     img = cv2.resize(img,None,fx=0.2,fy=0.2,interpolation=cv2.INTER_AREA)
    #     show_image(img)
    #     return pytesseract.image_to_string(img, config=lang_code)

def print_data(data):
	print(data)

def output_file(filename, data):
	file = open(filename, "w+")
	file.write(data)
	file.close()

# def spell_check(input):
#     nlp = spacy.load('en_core_web_sm')
#     contextualSpellCheck.add_to_pipe(nlp)
#     doc = nlp(input)

#     print(doc._.performed_spellCheck) #Should be True
#     print(doc._.outcome_spellCheck) #Income was $9.4 million compared to the prior year of $2.7 million.



def call_tesseract(cropped_images,doc=True):

    config_doc = "-l eng --oem 3 --psm 13" #psm 6
    config_non_doc = "-l eng --oem 3 --psm 8"

    if doc:
        config = config_doc
    else:
        config = config_non_doc
    
    final_text = ''
    index = 1000
    for image in cropped_images:
        
        
        data_eng = process_image(image, config, doc, index)
        index += 1
        # print("File:", f)
        # print("Data is:",data_eng)
        # print("-----------------------------------------")

        final_text += data_eng + ' '

        # print_data(data_ben)
        # output_file("eng.txt", data_eng)
        # output_file("ben.txt", data_ben)
    # cv2.destroyAllWindows()
    return final_text
