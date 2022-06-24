import os
import sys
from typing import final
import cv2
import numpy as np
import tempfile
import copy
from PIL import Image
from final.Tesseract_test import call_tesseract
from final.crop_images import generate_words
from final.crop_images_non_doc import sort_boxes
from final.crop_images_non_doc import generate_words_non_doc
from final.Spell_Check import SpellCorrection
from final.merge_n_sort import group_text_box

from final.page_dewarp.page_dewarp import page_dewarp
from final.deskew_img.deskew_img import deskew_img
from final.generate_bounding_box import generate_boxes
from final.text_prediction_non_doc.demo import predict_text_non_doc

def load_images_from_folder(folder):
    images = []
    for filename in os.listdir(folder):
        image_path = os.path.join(folder,filename)
        img = cv2.imread(image_path)
        if img is not None:
            images.append(image_path)
    return images

def show_image(img):
    cv2.imshow("capture image with printed text", img)
    k = 0
    while k%256 != 32:
        k = cv2.waitKey(1)

def ocr_doc(images_path):

    image_list = load_images_from_folder(images_path)

    deskewed_list = []

    for image in image_list:
        img = cv2.imread(image)
        rotated = deskew_img(img)
        deskewed_list.append(rotated)
        
        # path = image.split('.')[0] + '_deskew.' +  image.split('.')[1]
        # cv2.imwrite(path,rotated)

    # TODO: To be deleted completing pipeline
    dewarped_image_list = page_dewarp(deskewed_list, image_list)

    # for index, dewarped in enumerate(dewarped_image_list):
    #     print(dewarped)
    #     path = 'images\\' + dewarped.split('.')[0].split('\\')[-1] + '_dewarped.' +  dewarped.split('.')[1]
    #     temp_img = cv2.imread(dewarped)
    #     cv2.imwrite(path,temp_img)

    bbox_list, polys_list = generate_boxes(dewarped_image_list)

    # print(bbox_list[0][0], polys_list[0])

    # for index, polys in enumerate(polys_list):
        
    #     img = cv2.imread(dewarped_image_list[index])

    #     for box in polys:
    #         poly = np.array(box).astype(np.int32).reshape((-1))

    #         poly = poly.reshape(-1, 2)
            
    #         cv2.polylines(img, [poly.reshape((-1, 1, 2))], True, color=(0, 0, 255), thickness=2)
        
    #     # show_image(img)
        
    #     path = os.getcwd() +  '\\images\\' + str(index) + '.png'
    #     print(path)
    #     cv2.imwrite(path,img)

    merge_list_all_images = []
    image_read_list = []

    for index, polys in enumerate(polys_list):
        
        img = cv2.imread(dewarped_image_list[index])
        image_read_list.append(img)
        reshaped_polys = []

        for box in polys:       
            poly_shape = np.array(box).astype(np.int32).reshape((-1))   
            reshaped_polys.append(poly_shape)
        
        merge_list, free_list = group_text_box(reshaped_polys)
        merge_list_all_images.append(merge_list)
        # print(merge_list[0])

        # for box in merge_list:
        #     x_min,x_max,y_min,y_max=box[0],box[1],box[2],box[3]
        #     img=cv2.rectangle(img,(x_min,y_min),(x_max,y_max),(0,0,255),2)
        
        # show_image(img)
        # path = os.getcwd() +  '\\images\\' + str(index) + '.png'
        # print(path)
        # cv2.imwrite(path,img)

    final_string = ""
    success = True

    for index, merged in enumerate(merge_list_all_images):
        image = image_read_list[index]
        cropped = generate_words(merged,image)

        try:
            final_string += call_tesseract(cropped, doc=True) + '\n'
        except:
            success = False
            return final_string, success

    return final_string,success



def ocr_non_doc(images_path):

    image_list = load_images_from_folder(images_path)
    print(image_list[0])

    bbox_list, polys_list = generate_boxes(image_list)

# #
    # for index, polys in enumerate(polys_list):
        
    #     img = cv2.imread(image_list[index])

    #     for box in polys:
    #         poly = np.array(box).astype(np.int32).reshape((-1))

    #         poly = poly.reshape(-1, 2)
            
    #         cv2.polylines(img, [poly.reshape((-1, 1, 2))], True, color=(0, 0, 255), thickness=2)
        
    #     # show_image(img)
        
    #     path = os.getcwd() +  '\\images-nondoc\\res\\box' + str(index) + '.png'
    #     print(path)
    #     cv2.imwrite(path,img)
# #

    merge_list_all_images = []
    image_read_list = []

    for index, polys in enumerate(polys_list):

        reshaped_polys = []

        for box in polys:       
            poly_shape = np.array(box).astype(np.int32).reshape((-1))   
            reshaped_polys.append(poly_shape)
        
        img = cv2.imread(image_list[index])        
        word_list = generate_words_non_doc(reshaped_polys,img,image_list[index])    

        if len(word_list) == 0:
            return ""

        word_path_list = []
        # index= 1
        for word in word_list:
            # IF BAD PREDICTION, REMOVE THIS
            # pil_image = Image.fromarray(word)

            temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='_cropped.png')
            temp_filename = temp_file.name
            # pil_image.save(temp_filename)#,dpi=(300, 300))

            # temp_filename = "./maggi-f-cropped/maggi-"+str(index)+".png"
            cv2.imwrite(temp_filename,word)
            # show_image(word)
                
            # if index == 1:
            #     path = temp_filename
    
            word_path_list.append(temp_filename)
            # index+=1
        # img = cv2.imread(path)
        # show_image(img)
        print(word_path_list)
        model_path = './final/text_prediction_non_doc/TPS-ResNet-BiLSTM-Attn.pth'
        cropped_pred_list = predict_text_non_doc(word_path_list,model_path)
        #dictionary: key: path of the image, value: prediction: list[path,prediction,confidence]

        # for index, word in enumerate(word_path_list):
        #     print(cropped_pred_list[word])
        #     # print(corrected_word_list[index])
        #     print("-"*10)

        

        corrected_word_list = SpellCorrection(cropped_pred_list)
        
        final_string = ""

        for index, word in enumerate(word_path_list):
            final_string += corrected_word_list[word][1] + " "
            # print(corrected_word_list[index])
            # print("-"*10)

        return final_string

        
    # for index, merged in enumerate(merge_list_all_images):
    #     image = image_read_list[index]
    #     cropped = generate_words(merged,image)
    #     print(call_tesseract(cropped, doc=True))

def main():
    images_path = sys.argv[1]
    OCR_type = sys.argv[2] # doc, non-doc

    if OCR_type == 'doc':
        ocr_doc(images_path)
    else:
        ocr_non_doc(images_path)

    




    



if __name__ == "__main__":
    main()