class InputArgs:
    def __init__(self,image_list,saved_model,Transformation,FeatureExtraction,
    SequenceModeling,Prediction,num_gpu,num_fiducial=20,input_channel=1,
    output_channel=512,hidden_size=256,workers=4, batch_size=192,
    batch_max_length=25,imgH=32,imgW=100,rgb=False,character='0123456789abcdefghijklmnopqrstuvwxyz',
    sensitive=False, PAD=False):
        self.image_list = image_list
        self.saved_model = saved_model
        self.Transformation = Transformation
        self.FeatureExtraction = FeatureExtraction
        self.SequenceModeling = SequenceModeling
        self.Prediction = Prediction
        self.num_gpu = num_gpu
        self.num_fiducial = num_fiducial
        self.input_channel = input_channel
        self.rgb=rgb
        self.batch_max_length=batch_max_length
        self.batch_size=batch_size
        self.workers=workers
        self.hidden_size=hidden_size
        self.output_channel=output_channel
        self.imgW=imgW
        self.imgH=imgH
        self.character=character
        self.sensitive = sensitive
        self.PAD = PAD
        