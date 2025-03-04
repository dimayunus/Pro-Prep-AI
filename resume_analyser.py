
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains.llm import LLMChain
from langchain_core.prompts import ChatPromptTemplate
from langchain_community.document_loaders import PyPDFLoader
from langchain_openai import ChatOpenAI
from langchain_core.output_parsers import JsonOutputParser
from dotenv import load_dotenv


load_dotenv()

def generate_question(pdf_path:str ,number_of_questions : int):
    
    """ Analyze a student's resume from a PDF file and generate questions based on the content"""
    
    try:
        # Initialize the LLM with OpenAI GPT-4o-mini
        llm = ChatOpenAI(model="gpt-4o-mini")

        # Define the prompt structure
        prompt = ChatPromptTemplate.from_messages([
            ("system", """Analyse the given resume of a student and generate {number} questions based on the resume. 
                           Your response should be in the following JSON format: 
                           {{
                               'questions': []
                           }}"""),
            ("human", """The resume content is as follows:\n\n{context}""")
        ])
                # Load the PDF resume
        loader = PyPDFLoader(pdf_path)
        docs = loader.load()

        # Create a document chain using the defined LLM and prompt
        chain = create_stuff_documents_chain(llm, prompt)

        # Initialize the output parser for JSON format
        output_parser = JsonOutputParser()

        # Invoke the chain with the context of the loaded documents
        result = chain.invoke({"context": docs, "number": number_of_questions})

        # Parse the chain's result using the JSON output parser
        parsed_output = output_parser.parse(result)

        return parsed_output

    except Exception as e:
        return {"error": str(e)}




def get_results(response):
    
    """ Analyze a student's answer to the interview question and give marks"""
    
    try:
        # Initialize the LLM with OpenAI GPT-4o-mini
        llm = ChatOpenAI(model="gpt-4o-mini")

        # Define the prompt structure
        prompt = ChatPromptTemplate.from_messages([
            ("system", """Analyse the given answers from interview questions and generate various metrics to the responses. 
                        You should analyse the confidence of the answer, 
                        You should analyse the language proficieny of the answer,
                        You should analyse the factual accuracy of the answer,
                        You should do the sentiment analysis of the answer,
                        the rating should be in between 1 to 5
             
                        response should be for all answer in general, not for individual
                        Your response should be in the following JSON format: 
                           {{
                               "confidence": int,
                                "languageProficency":int,
                                "factualAccuracy":int,
                                sentiment:{{
                                    "positive":int,
                                    "negative":int
                                }}

                           }}"""),
            ("human", """The question and answer is as follows:
             \n\n{context}""")
        ])
        # Format the prompt with the provided context
        formatted_prompt = prompt.format_prompt(context=response)

        # Initialize the output parser for JSON format
        output_parser = JsonOutputParser()

        # Invoke the chain with the context of the loaded documents
        result = llm.invoke(formatted_prompt.to_messages())

        # Parse the chain's result using the JSON output parser
        parsed_output = output_parser.parse(result.content)
        print(parsed_output)
        return parsed_output

    except Exception as e:
        return {"error": str(e)}




























# llm = ChatOpenAI(model="gpt-4o-mini")


# # Define the prompt structure
# prompt = ChatPromptTemplate.from_messages([
#     ("system", """Analyse the given resume of a student and generate {number} questions based on the resume. 
#                    Your response should be in the following JSON format: 
#                    {{
#                        'questions': []
#                    }}"""),
#     ("human", """The resume content is as follows:\n\n{context}""")
# ])


# loader = PyPDFLoader("/home/owly/Desktop/sapience/cv_analyser/cv.pdf")
# docs = loader.load()

# chain = create_stuff_documents_chain(llm, prompt)
# # Invoke chain
# output_parser = JsonOutputParser()
# # result = llm.invoke(prompt,context = docs,number=8)

# re =chain.invoke({"context": docs,"number":4})
# parser = output_parser.parse(re)

# print(parser)

