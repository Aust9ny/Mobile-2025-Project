// styles/BookDetailScreenStyle.tsx
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },

    genre: {
        fontSize: 22,
        fontWeight: '700',
        color: '#115566',
        textAlign: 'center',
        marginTop: 16,
    },

    cover: {
        width: 250,           
        height: 400,         
        resizeMode: 'cover',
        backgroundColor: '#fff', 
        alignSelf: 'center',    
        marginVertical: 16,
    },

    title: {
        fontSize: 24,
        fontWeight: '800',
        color: '#000',
        textAlign: 'center',
        marginBottom: 4,
    },

    authorPublisher: {
        fontSize: 14,
        color: '#777',
        textAlign: 'center',
        marginBottom: 12,
    },

    borrowBtn: {
        backgroundColor: '#004d61',
        marginHorizontal: 16,
        borderRadius: 50,
        paddingVertical: 14,
        alignItems: 'center',
        marginBottom: 16,
    },

    borrowText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },

    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginHorizontal: 16,
        marginBottom: 16,
    },

    statItem: {
        alignItems: 'center',
    },

    statLabel: {
        fontSize: 15,
        color: '#000',
    },

    statNumber: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 4,
    },

    available: {
        color: '#115566',
    },

    total: {
        color: 'red',
    },

    borrowed: {
        color: 'red',
    },

    separator: {
        height: 1,
        backgroundColor: '#ccc',
        marginHorizontal: 16,
        marginBottom: 16,
    },

    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 8,
    },

    summaryTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#115566',
    },

    favoriteContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 4,
    },

    favoriteText: {
        fontSize: 16,
        color: '#115566',
        marginLeft: 8,
    },

    favoriteIcon: {
        width: 30,
        height: 30,
        resizeMode: 'contain',
    },

    summaryText: {
        fontSize: 16,
        color: '#333',
        lineHeight: 22,
        marginHorizontal: 16,
        marginBottom: 24,
    },
});
