from spellchecker import SpellChecker

thres = 0.95

spell = SpellChecker()

def SpellCorrection(word_dict):
    # find those words that may be misspelled
    word_list = list(word_dict.values())
    # print(word_list)
    
    misspelled = spell.unknown([word[1] for word in word_list])

    misspelled_dict = {}

    for index,word in enumerate(misspelled):
        # Get the one `most likely` answer
        print(word, spell.correction(word))
        misspelled_dict[word] = spell.correction(word)
        # word_list[index][1] = spell.correction(word)

    for key,value in word_dict.items():
        # print(int(value[2]))
        if value[1] in misspelled_dict and float(value[2])<thres:
            word_dict[key][1] = misspelled_dict[value[1]]

    return word_dict