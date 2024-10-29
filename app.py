import streamlit as st
from PyPDF2 import PdfReader
from langchain.text_splitter import RecursiveCharacterTextSplitter
import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings
import google.generativeai as genai
from langchain.vectorstores import FAISS
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.chains.question_answering import load_qa_chain
from langchain.prompts import PromptTemplate
from dotenv import load_dotenv
import language_tool_python
from spellchecker import SpellChecker

# Configure generative AI with the API key
load_dotenv()
os.environ['GOOGLE_API_KEY'] = 'AIzaSyAXpQJv3URmWWeqXbRQd5zHIgqvKoSTvSg'
genai.configure(api_key="AIzaSyAXpQJv3URmWWeqXbRQd5zHIgqvKoSTvSg")
genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

# Initialize language tool and spell checker
grammar_tool = language_tool_python.LanguageTool('en-US')
spell_checker = SpellChecker()

def get_pdf_text(pdf_docs):
    text = ""
    for pdf in pdf_docs:
        pdf_reader = PdfReader(pdf)
        for page in pdf_reader.pages:
            text += page.extract_text()
    return text

def get_text_chunks(text):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=10000, chunk_overlap=10000)
    chunks = text_splitter.split_text(text)
    return chunks

def get_vector_store(text_chunks):
    embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")
    vector_store = FAISS.from_texts(text_chunks, embedding=embeddings)
    vector_store.save_local("faiss_index")

def get_conversational_chain():
    prompt_template = """
    Answer the question as detailed as possible from the provided context, make sure to provide all the details. If the answer is not in
    provided context, just say, "answer is not available in the context". Don't provide the wrong answer\n\n
    Context:\n {context}?\n
    Question: \n{question}\n

    Answer:
    """

    model = ChatGoogleGenerativeAI(model="gemini-pro", temperature=0.3)
    prompt = PromptTemplate(template=prompt_template, input_variables=["context", "question"])
    chain = load_qa_chain(model, chain_type="stuff", prompt=prompt)
    return chain

def user_input(user_question):
    try:
        # Spell check and correct user input
        corrected_question = spell_check_and_correct(user_question)

        embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001")

        new_db = FAISS.load_local("faiss_index", embeddings)
        docs = new_db.similarity_search(corrected_question)

        chain = get_conversational_chain()

        response = chain(
            {"input_documents": docs, "question": corrected_question},
            return_only_outputs=True
        )
        # Display user feedback with the corrected question and reply
        st.write("Original Question:", user_question)
        st.write("Corrected Question:", corrected_question)
        st.write("Reply:", response["output_text"])

    except Exception as e:
        # Print the exception details to identify the issue
        st.error(f"An error occurred: {e}")
        print(f"Error details: {e}")

def spell_check_and_correct(text):
    # Spell check and correct the text
    spell_checker.unknown(text)
    corrected_text = ' '.join(spell_checker.correction(word) for word in text.split())

    # Grammar check using language tool
    try:
        matches = grammar_tool.check(corrected_text)
        corrected_text = grammar_tool.correct(matches)
    except Exception as e:
        st.warning(f"Grammar check failed: {e}")
        return text  # If grammar check fails, return the original text
    
    return corrected_text

def main():
    st.set_page_config("Chat PDF")
    st.header("HyperX")

    user_question = st.text_input("Ask a Question from the PDF Files")

    if user_question:
        user_input(user_question)

    with st.sidebar:
        st.title("Menu:")
        pdf_docs = st.file_uploader("Upload your PDF Files and Click on the Submit & Process Button", accept_multiple_files=True)
        if st.button("Submit & Process"):
            with st.spinner("Processing..."):
                raw_text = get_pdf_text(pdf_docs)
                text_chunks = get_text_chunks(raw_text)
                get_vector_store(text_chunks)
                st.success("Done")

if __name__ == "__main__":
    main()