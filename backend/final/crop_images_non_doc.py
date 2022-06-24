import os
import numpy as np
import cv2
from scipy.spatial import distance

def get_minimum(box,dim):
  if dim=='x':
    return min(box[0:8:2])
  else:
    return min(box[1:8:2])

def sort_boxes(box, cols):
    tolerance_factor = 125#100
    x_min = get_minimum(box,'x')
    y_min = get_minimum(box,'y')
    return ((y_min // tolerance_factor) * tolerance_factor) * cols + x_min

def deskew_image(image,angle):
  (h, w) = image.shape[:2]
  center = (w // 2, h // 2)
  M = cv2.getRotationMatrix2D(center, angle, 1.0)
  rotated = cv2.warpAffine(image, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
  return rotated

def euclidean_dist(a,b):
  return distance.euclidean(a, b)

def countFunc(counter,numOfDigits):
  return str(counter).zfill(numOfDigits)

def deskew_n_pad(img,coord):
  x2,y2=coord[0],coord[1]
  x1,y1=coord[6],coord[7]

  (x1,y1)=(coord[0],coord[1])
  (x2,y2)=(coord[2],coord[3])
  (x4,y4)=(coord[6],coord[7])

  dist_12=euclidean_dist((x1,y1),(x2,y2))
  dist_14=euclidean_dist((x1,y1),(x4,y4))

  if (dist_12>dist_14):
    to_extend_width=dist_12
    to_extend_height=dist_14
    slope=(y2-y1)/(x2-x1)
  else:
    to_extend_width=dist_14
    to_extend_height=dist_12
    
    try:
      slope=(y1-y4)/(x1-x4)
    except:
      if y1<y4:
        slope=float('-inf')
      else:
        slope=float('inf')

  angle=np.arctan(slope)*57

  height,width=img.shape[0],img.shape[1]
  
  #add padding if our image's width is less than that would be after rotated
  add_padding_side=0
  if (width<to_extend_width):
    add_padding_side=int((to_extend_width-width)//2)

  to_crop=0
  if (height>to_extend_height):
    to_crop=int((height-to_extend_height)//2)

  img = cv2.copyMakeBorder(img,0, 0,add_padding_side,add_padding_side, cv2.BORDER_CONSTANT)
  img_deskewed=deskew_image(img,angle)
  
  img_deskewed=img_deskewed[to_crop:height-to_crop,:]

  return img_deskewed, angle

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
  cv2.bitwise_not(bg,bg, mask=mask)
  dst2 = bg + dst

  return dst2


def show_image(img):
    cv2.imshow("capture image with printed text", img)
    k = 0
    while k%256 != 32:
        k = cv2.waitKey(1)

def eliminate_boxes(demo_list,image):
  thres = 0.0010
  height,width=image.shape[0],image.shape[1]
  area = height*width

  final_list=[]
  for curr in demo_list:
    para_area=(curr[7]-curr[1])*(curr[4]-curr[6])
    ratio=para_area/area
    if (ratio<thres):
      continue
    else:
      final_list.append(curr)
  return final_list


def generate_words_non_doc(demo_list, image, name):

  demo_list = eliminate_boxes(demo_list,image)

  demo_list.sort(key=lambda box:sort_boxes(box, image.shape[1]))
  img = image.copy()
  for i,box in enumerate(demo_list):
    # poly = np.array(box).astype(np.int32).reshape((-1))

    poly = box.reshape(-1, 2)
  
    cv2.polylines(img, [poly.reshape((-1, 1, 2))], True, color=(0, 0, 255), thickness=2)
    # for i in range(len(temp)):
    # img = cv2.putText(img, str(i), [box[0],box[1]], cv2.FONT_HERSHEY_COMPLEX, 4, [0,0,255], 3,cv2.LINE_AA)

  # path = os.getcwd() +  '\\images-nondoc\\res\\eli_box' + name.split('\\')[-1]
  # print(path)
  # cv2.imwrite(path,img)
      
  # show_image(image)
  cur_path = os.path.dirname(os.path.realpath(__file__))
  # cv2.imwrite(cur_path + '/test-image' + name.split('\\')[1],img)

  word_list = []
  avg_angle = 0

  for index,num in enumerate(demo_list):
    l_t,t_l=num[0],num[1]
    r_t,t_r=num[2],num[3]
    r_b,b_r=num[4],num[5] 
    l_b,b_l=num[6],num[7]
    pts = np.array([[int(l_t), int(t_l)], [int(r_t) ,int(t_r)], [int(r_b) , int(b_r)], [int(l_b), int(b_l)]])
    
    if np.all(pts) > 0:
      word = crop(pts, image)
      path = os.getcwd() +  '\\images-nondoc\\res\\orig_word' + str(index) + name.split('\\')[-1]
      # print(path)
      #cv2.imwrite(path,word)
      word, angle = deskew_n_pad(word,num)
      path = os.getcwd() +  '\\images-nondoc\\res\\deskewed_word' + str(index) + name.split('\\')[-1]
      # print(path)
      #cv2.imwrite(path,word)
      word_list.append(word)

  return word_list

  # for image_num in range(1):
  #   image_name = "maggi-f"
  #   image = cv2.imread('./imgs-08-02-22/' + image_name + '.jpg')
  #   f = open("./cordinate-files/res_maggi-f.txt", "r")
  #   demo_list = [list(map(int,x[:-1].split(','))) for x in f.readlines() if x!='\n']
  #   generate_words(image_name, demo_list, image)
