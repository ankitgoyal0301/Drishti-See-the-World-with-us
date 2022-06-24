import os
import time
import argparse

import torch
import torch.nn as nn
import torch.backends.cudnn as cudnn

import cv2
from final import test   
from final import imgproc
from final.craft import CRAFT

def str2bool(v):
    return v.lower() in ("yes", "y", "true", "t", "1")

def generate_boxes(image_list, trained_model='.\\final\\craft_mlt_25k.pth', cuda=False):

    # #CRAFT
    # parser = argparse.ArgumentParser(description='CRAFT Text Detection')
    # parser.add_argument('--trained_model', default='weights/craft_mlt_25k.pth', type=str, help='pretrained model')
    # parser.add_argument('--text_threshold', default=0.7, type=float, help='text confidence threshold')
    # parser.add_argument('--low_text', default=0.4, type=float, help='text low-bound score')
    # parser.add_argument('--link_threshold', default=0.4, type=float, help='link confidence threshold')
    # parser.add_argument('--cuda', default=True, type=str2bool, help='Use cuda for inference')
    # parser.add_argument('--canvas_size', default=1280, type=int, help='image size for inference')
    # parser.add_argument('--mag_ratio', default=1.5, type=float, help='image magnification ratio')
    # parser.add_argument('--poly', default=False, action='store_true', help='enable polygon type')
    # parser.add_argument('--show_time', default=False, action='store_true', help='show processing time')
    # parser.add_argument('--test_folder', default='/data/', type=str, help='folder path to input images')
    # parser.add_argument('--refine', default=False, action='store_true', help='enable link refiner')
    # parser.add_argument('--refiner_model', default='weights/craft_refiner_CTW1500.pth', type=str, help='pretrained refiner model')

    # args = parser.parse_args()

    defaults = {'canvas_size': 1280, 'mag_ratio':1.5,'show_time':False}

    """ For test images in a folder """
    # image_list, _, _ = file_utils.get_files(args.test_folder)

    image_names = []
    image_paths = []

    #CUSTOMISE START
    # start = args.test_folder

    # for num in range(len(image_list)):
    #     image_names.append(os.path.relpath(image_list[num], start))


    # result_folder = 'Results'
    # if not os.path.isdir(result_folder):
    #     os.mkdir(result_folder)

    # data=pd.DataFrame(columns=['image_name', 'word_bboxes', 'pred_words', 'align_text'])
    # data['image_name'] = image_names

    # load net
    net = CRAFT()     # initialize

    # print('Loading weights from checkpoint (' + args.trained_model + ')')
    if cuda:
        net.load_state_dict(test.copyStateDict(torch.load(trained_model)))
    else:
        net.load_state_dict(test.copyStateDict(torch.load(trained_model, map_location='cpu')))

    if cuda:
        net = net.cuda()
        net = torch.nn.DataParallel(net)
        cudnn.benchmark = False

    net.eval()

    # LinkRefiner
    refine_net = None
    # if args.refine:
    #     from refinenet import RefineNet
    #     refine_net = RefineNet()
    #     print('Loading weights of refiner from checkpoint (' + args.refiner_model + ')')
    #     if args.cuda:
    #         refine_net.load_state_dict(test.copyStateDict(torch.load(args.refiner_model)))
    #         refine_net = refine_net.cuda()
    #         refine_net = torch.nn.DataParallel(refine_net)
    #     else:
    #         refine_net.load_state_dict(test.copyStateDict(torch.load(args.refiner_model, map_location='cpu')))

    #     refine_net.eval()
    #     args.poly = True

    t = time.time()

    image_boxes = []
    polys_list = []

    # load data
    for k, image_path in enumerate(image_list):
        print("Test image {:d}/{:d}: {:s}".format(k+1, len(image_list), image_path), end='\r')
        image = imgproc.loadImage(image_path)

        bboxes, polys, score_text, det_scores = test.test_net(net, image, 0.7, 0.4, 0.4, cuda, False, defaults, refine_net)
        image_boxes.append(bboxes)
        polys_list.append(polys)
        # print(polys[0])
        # bbox_score={}

        # for box_num in range(len(bboxes)):
        #     key = str (det_scores[box_num])
        #     item = bboxes[box_num]
        #     bbox_score[key]=item

        # data['word_bboxes'][k]=bbox_score
        # save score text
        filename, file_ext = os.path.splitext(os.path.basename(image_path))
        # mask_file = result_folder + "/res_" + filename + '_mask.jpg'
        # cv2.imwrite(mask_file, score_text)

        # UNCOMMENT TO SAVE THE IMAGES AND ANNOTATIONS
        # file_utils.saveResult(image_path, image[:,:,::-1], polys)

    return image_boxes, polys_list
    # data.to_csv('./content/Pipeline/data.csv', sep = ',', na_rep='Unknown')
    # print("elapsed time : {}s".format(time.time() - t))
