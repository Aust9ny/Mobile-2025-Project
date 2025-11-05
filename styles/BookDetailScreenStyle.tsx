import { StyleSheet } from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f7fb',
        padding: 12,
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
        marginBottom: 20,
    },

    // ปุ่มยืมหนังสือ
    borrowButton: {
        backgroundColor: '#115566',
        marginHorizontal: 16,
        borderRadius: 50,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 3,
    },
    borrowButtonDisabled: {
        backgroundColor: '#999',
        opacity: 0.6,
    },
    borrowButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
    },

    // สถิติหนังสือ
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginHorizontal: 20,
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statLabel: {
        fontSize: 15,
        color: '#000',
        fontWeight: '500',
        marginBottom: 6,
    },
    statValue: {
        fontSize: 20,
        color: '#000',
        fontWeight: '700',
    },
    statValueRed: {
        color: '#D32F2F',
    },

    // เส้นคั่น
    divider: {
        height: 1,
        backgroundColor: '#d0d0d0',
        marginHorizontal: 16,
        marginVertical: 20,
    },

    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 12,
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

    favoriteIcon: {
        width: 28,
        height: 28,
        resizeMode: 'contain',
    },

    favoriteText: {
        fontSize: 15,
        color: '#115566',
        marginLeft: 6,
        fontWeight: '600',
    },

    summaryText: {
        fontSize: 15,
        color: '#333',
        lineHeight: 24,
        marginHorizontal: 16,
        marginBottom: 30,
        textAlign: 'justify',
    },
});