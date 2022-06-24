from operator import iadd
import os
from tkinter import image_names
from cv2 import imread
import numpy as np
import cv2
import pandas as pd
# from google.colab.patches import cv2_imshow

def crop(pts, image):

  """
  Takes inputs as 8 points
  and Returns cropped, masked image with a white background
  """
  rect = cv2.boundingRect(pts)
  x,y,w,h = rect
  cropped = image[y:y+h, x:x+w].copy()
  pts = pts - pts.min(axis=0)
  mask = np.zeros(cropped.shape[:2], np.uint8)
  cv2.drawContours(mask, [pts], -1, (255, 255, 255), -1, cv2.LINE_AA)
  dst = cv2.bitwise_and(cropped, cropped, mask=mask)
  bg = np.ones_like(cropped, np.uint8)*255
  cv2.bitwise_not(bg, mask=mask)
  dst2 = bg + dst

  return dst2

def countFunc(counter,numOfDigits):
  return str(counter).zfill(numOfDigits)

def generate_words(merge_list, image):
  
  cropped_list = []
  index = 0
  for num in merge_list:
    # bbox_coords = score_bbox[num].split(':')[-1].split(',\n')
    l_t,t_l=num[0],num[2] #x_min,y_min
    r_t,t_r=num[1],num[2] #x_max,y_min
    r_b,b_r=num[1],num[3] #x_max,y_max
    l_b,b_l=num[0],num[3] #x_min,y_max
    pts = np.array([[int(l_t), int(t_l)], [int(r_t) ,int(t_r)], [int(r_b) , int(b_r)], [int(l_b), int(b_l)]])
      
    if np.all(pts) > 0:
      word = crop(pts, image)
      cropped_list.append(word)
      # path = os.getcwd() +  '\\images\\cropped' + str(index) + '.png'
      # print(path)
      # cv2.imwrite(path,word)
      index += 1

  return cropped_list